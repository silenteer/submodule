import { debug, instrument, InstrumentFunction } from "./instrument";
import createDebug from 'debug'

const d = createDebug('submodule.core')

type Provider<O> = (() => O | Promise<O>)
type inferProvider<T> = T extends Provider<infer V> ? Awaited<V> : T

export type Submodule<Provide, Dependent> = (dependent: Dependent) => Provide | Promise<Provide>

type Executable<Services, Input, Output> = (services: Services, input: Input) => Output | Promise<Output>

export type ExecutableOptions<InitArgs> = {
  eager?: boolean,
  initArgs?: InitArgs,
  instrument?: InstrumentFunction
}

const defaultExecutableOptions: ExecutableOptions<any> = {
  eager: true,
  initArgs: undefined
}

export type Executor<Services> = {
  execute: <Input extends any, Output> (executable: Executable<Services, inferProvider<Input>, Output>, input?: Input) => Promise<Output>
  prepare: <Input extends any, Output> (executable: Executable<Services, inferProvider<Input>, Output>) => (input: Input) => Promise<Output>
  get(): Promise<Services>
}

export const prepareExecutable = function <Services, Dependent>(
  submoduleDef: Submodule<Services, inferProvider<Dependent>>,
  options?: ExecutableOptions<Dependent>
): Executor<Services> {
  let cached: Promise<{ initArgs: any, services: any }> | undefined = undefined

  const opts = { ...defaultExecutableOptions, ...options }

  const submodule = { ...submoduleDef }
  instrument(submodule, debug)

  if (opts.instrument) {
    instrument(submodule, opts.instrument)
  }

  async function load() {
    const initArgs = (options?.initArgs !== undefined && typeof options?.initArgs === 'function')
      ? await options.initArgs()
      : options?.initArgs

    const services = await submoduleDef(initArgs)
    return { initArgs, services }
  }

  function get() {
    if (cached == undefined) {
      d('cache is uninitialized, initializing ...')
      cached = load()
    }
    return cached
  }

  if (opts.eager) {
    d('eager loading, cache status %S', cached)
    get()
  }

  return {
    async execute(caller, param) {
      const { services } = await get()

      const input = (param !== undefined && typeof param === 'function')
        ? await param()
        : param

      return await caller(services, input)
    },
    prepare(caller) {
      return async (param) => {
        const { services } = await get()

        const input = (param !== undefined && typeof param === 'function')
          ? await param()
          : param

        return await caller(services, input)
      }
    },
    async get() {
      const { services } = await get()
      return services
    }
  }
}
