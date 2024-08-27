const supportedType = ['object', 'array']

export const proxify = <T>(value: Readonly<T>) => {
  const proxied = {}

  if (!supportedType.includes(typeof value)) {
    return {
      value,
      update: () => { throw new Error('not supported') }
    }
  }

  let ref: object = value as any

  return {
    value: new Proxy(proxied, {
      apply(_, thisArgs, argumentList) {
        const refFn = ref as unknown as () => any

        return refFn.apply(thisArgs, argumentList)
      },
      get(_, prop, __) {
        const value = Reflect.get(ref, prop)
        return proxify(value).value
      },
      set(_, prop, value, __) {
        return Reflect.set(ref, prop, value)
      }
    }) as typeof value,
    update: (newValue: T) => {
      ref = newValue as any
    }
  }
}