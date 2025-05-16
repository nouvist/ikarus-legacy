// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

Object.defineProperty(window, "API", {
  value: {
    hello: () => {
      console.log("Hello from Node.js!");
    },
  },
});
