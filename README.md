# Unrestricted filesystem resource for Pareto

`write file` receives `content.paragraph` and
`content.parameters.{indentation,newline}`. It walks the paragraph directly
using Pareto Fountain Pen's chunk serializer and writes to the file stream
without constructing intermediate string lists.

Indentation is explicit (typically four spaces). Each serialized sentence ends
with the supplied newline. Empty paragraphs produce empty files.

After compiling against the migrated API and Fountain Pen packages, run:

```sh
node --test testdata/paragraph-files.test.mjs
```
