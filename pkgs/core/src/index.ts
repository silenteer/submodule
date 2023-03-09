import type { A } from "ts-toolbelt"
import type { WatchOptions } from "chokidar"

export type RouteLike<AdaptorContext = unknown> = {
  handle: (context: AdaptorContext) => unknown | Promise<unknown>
}

export type SubmoduleArgs = {
  cwd: string,
  config: string,
  routeDir: string,
  dev: boolean,
  nowatch?: string
}

export type DefaultRouteModule<
  Input = unknown,
  Output = unknown,
  Config = unknown,
  Services = unknown,
  Context = unknown
> = {
  default: (input: A.Compute<{ config: Config, services: Services, context: Context, input: Input }>) => Output | Promise<Output>
}

export type ArgShape = {
  name: string
  description?: string
  required?: boolean
  defaultValue?: string
  value?: string
}

export type OptShape = {
  name: string
  shortName?: string
  required?: boolean
  defaultValue?: string
  value?: string
}

export type Action = (input: { subCommand: string, args: string[], opts: Record<string, string> }) => void | Promise<void>

export type CommandShape = {
  description?: string
  args?: A.Compute<Omit<ArgShape, 'value'>>[]
  opts?: A.Compute<Omit<OptShape, 'value'>>[]
  action: Action
}

export type Commands = Record<string, CommandShape | Action>

export type Submodule<
  Config = unknown,
  Services = unknown,
  Context = unknown,
  RouteModule = DefaultRouteModule<unknown, unknown, Config, Services, Context>,
  Route extends RouteLike<Context> = RouteLike<Context>,
  Router extends Record<string, Route> = Record<string, Route>> = A.Compute<{
    submodule?: {
      appName?: string
      appVersion?: string
      buildNumber?: string
      gitCommit?: string

      chokidarOptions?: WatchOptions
      traceEnabled?: boolean
      otlpUrl?: string
    }
    loaders?: {
      moduleLoader?: (input: { config: Config, submoduleArg: SubmoduleArgs }) => Promise<Record<string, RouteModule>>
    }
    createConfig?: () => Config | Promise<Config>
    createServices?: (input: { config: Config }) => Services | Promise<Services>
    createRoute?: (input: { config: Config, services: Services, routeModule: RouteModule, routeName: string }) => Promise<Route> | Route
    createRouter?: (input: { config: Config, services: Services, routeModules: Record<string, Route> }) => Router | Promise<Router>
    createCommands?: (input: { config: Config, services: Services, router: Router, subCommand?: string, commandArgs: string[], submoduleArgs: SubmoduleArgs }) => (void | Commands) | Promise<void | Commands>
  }>

export type SubmoduleInstance<
  Config = unknown,
  Services = unknown,
  Context = unknown,
  RouteModule = DefaultRouteModule<unknown, unknown, Config, Services, Context>,
  Route extends RouteLike<Context> = RouteLike<Context>,
  Router extends Record<string, Route> = Record<string, Route>
> = {
  config: Config
  services: Services
  router: Router
  submodule: Submodule<Config, Services, Context, RouteModule, Route, Router>
}