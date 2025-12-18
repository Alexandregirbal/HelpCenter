As mentionned is this dicussion about [File upload and Client implementation](https://github.com/RobinTail/express-zod-api/discussions/2821), I will try and make my third point clearer.

# Zod .transform(...)
To json schema is undefined

> The .transform() method is extremely useful, but it has one major downside: the output type is no longer introspectable at runtime. The transform function is a black box that can return anything. This means (among other things) there's no sound way to convert the schema to JSON Schema.

https://zod.dev/v4?id=overwrite