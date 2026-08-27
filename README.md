# ISTN Agent

> [!NOTE]
> This project has been superseded by [Ikarus](https://github.com/nouvist/ikarus).

## Build

This project relies heavily on Electron Forge and Vite for building and
development workflows.

### Requirements

To debug, develop, and build the application, the following tools are required:

- **Node.js**: Ensure you have Node.js installed with version 22 or higher is
  recommended.
- **PNPM**: PNPM is the preferred package manager for this project, but you can
  substitute it with NPM, Yarn, Bun, or any NPM-compatible package managers
  if needed.

### Development Build

Run the following command to start the application in development mode:

```sh
pnpm start
```

### Release Build Without Packaging

Run the following command to build the release version:

```sh
pnpm package -p linux -a x64 # linux build
pnpm package -p win32 -a x64 # windows build
```
