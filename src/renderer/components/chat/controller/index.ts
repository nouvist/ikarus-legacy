import { useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { BrowserController } from "~/renderer/components/browser/view/raw";
import {
  AssistantMessage,
  Message,
  SystemMessage,
  UserMessage,
} from "~/renderer/components/chat";
import RunnerFacade from "~/renderer/components/chat/controller/runner_facade";
import { Completer, inline } from "~/shared/core";
import { CombinedMutexes, Mutex, Rxjs } from "~/shared/rxjs";

export function useChatController(browser: BrowserController) {
  const ref = useRef<ChatController>(null);
  return (ref.current ??= new ChatController(browser));
}

export class ChatController {
  protected _isInitialized = false;
  protected _browser: BrowserController;
  protected _runner = new RunnerFacade();
  protected _messages = new BehaviorSubject<Message[]>([]);
  protected _messagesMutex = new Mutex();
  protected _mutex = new CombinedMutexes(
    this._messagesMutex,
    this._runner.mutex
  );

  readonly messages = Rxjs.asImmutable(this._messages);
  readonly mutex = this._mutex.asImmutable();

  protected static _defaultMessages: Message[] | undefined;

  protected static _instance: ChatController | undefined;
  protected static _completer = new Completer();
  static get instance() {
    if (!this._instance) throw new Error("ChatController is not initialized");
    return this._instance;
  }

  static async waitInstance() {
    await this._completer.wait();
    return this.instance;
  }

  protected static createDefaultMessages() {
    if (!this._defaultMessages) {
      this._defaultMessages = [
        new SystemMessage(
          inline(`
            Kamu adalah Babon, asisten browser yang cerdas dan siap sedia
            bantuin kamu menjelajah internet. Biasanya yang bakal jadi pengguna
            itu orangnya santai banget, jadi kalau ngobrol sama dia, pakai
            bahasa sehari-hari aja ya, kayak lagi ngobrol sama teman. Kecuali,
            kalau dia agak beda dan lebih formal atau menuntut, kamu harus bisa
            menyesuaikan juga. Tapi, kamu enggak usah pakai bahasa yang
            ribet-ribet atau teknis. Pengguna ngerti kamu punya berbagai cara
            buat bantuin dia, jadi kamu enggak perlu nyebutin spesifik alat apa
            yang kamu pakai. Pokoknya, kalau pengguna minta tolong apa pun, kamu
            langsung pikirin gimana caranya biar pengguna bisa dapetin apa yang
            pengguna mau.
            
            Kalau pengguna minta kamu nyari sesuatu, ngisi form, atau ngeklik
            tombol, kamu yang mutusin sendiri langkah-langkahnya. Misalnya,
            kalau pengguna minta klik tombol, kamu enggak perlu nunggu pengguna
            bilang "cari tombolnya dulu, ya", kamu langsung aja cari dan klik
            tombolnya. Pokoknya, kalau pakai tool buat ambil data, gak perlu
            nanya. Bahkan, hal-hal umum kamu bisa klik atau ubah tanpa nanya
            juga. Intinya, kamu itu mandiri banget.

            Yang paling penting, kalau pengguna nyuruh sesuatu, kamu jangan
            pernah bilang "enggak bisa" atau "aku enggak punya alatnya" kalau
            sebetulnya itu bisa kamu kerjakan pakai kombinasi dari semua cara
            yang kamu punya. Pikirin aja gimana caranya sampai tujuanku
            tercapai. Kamu itu solusi buat semua masalahku di internet, jadi
            jangan nyerah ya! Pengguna percaya kamu bisa mikirin sendiri langkah
            terbaik buat aku.
          `)
        ),
      ];

      for (const message of this._defaultMessages) {
        if (!(message instanceof AssistantMessage)) continue;
        message.complete();
      }
    }

    return [
      new SystemMessage(
        inline(`
          Anda adalah AI browser yang membantu pengguna berinteraksi dengan
          halaman web. Fokus pada navigasi, ekstraksi informasi, dan tindakan
          dasar. Anda mampu membangun dan mengeksekusi perintah secara berurutan
          untuk menyelesaikan tugas yang lebih kompleks.
        `)
      ),
    ];
    // promptnya rada bego
    // return Array.from(this._defaultMessages);
  }

  constructor(browser: BrowserController) {
    this._browser = browser;

    this.ensureInitialized = this.ensureInitialized.bind(this);
    this.waitUntilReady = this.waitUntilReady.bind(this);
    this.invoke = this.invoke.bind(this);
    this.concat = this.concat.bind(this);

    (window as any)["chat"] = this;
    (window as any)["msg"] = this.messages.getValue;

    if (ChatController._instance) {
      console.warn("[ChatController] ada banyak, yang terakhir yang dipakai");
    }
    ChatController._instance = this;
    ChatController._completer.resolve();
  }

  async ensureInitialized() {
    if (this._isInitialized) return;
    this._isInitialized = true;

    await this._runner.ensureInitialized(this._browser);
    this._messages.next(ChatController.createDefaultMessages());
    this._messagesMutex.next(true);
  }

  waitUntilReady() {
    return Promise.all([
      this._browser.waitUntilBound(),
      Rxjs.waitUntil(this._messagesMutex, Boolean),
    ]);
  }

  concat(next: Message[] | Message) {
    const currentMessages = this.messages.value;
    if (Array.isArray(next)) {
      this._messages.next([...currentMessages, ...next]);
    } else {
      this._messages.next([...currentMessages, next]);
    }
  }

  async invoke(message: string) {
    try {
      this._messagesMutex.next(false);
      this.concat(new UserMessage(message));
      const abort = new AbortController();
      (window as any)["cancel"] = abort.abort.bind(abort);
      await this._runner.stream({
        messages: this.messages.value,
        callback: this.concat,
        abortSignal: abort.signal,
      });
    } finally {
      this._messagesMutex.next(true);
    }
  }
}
