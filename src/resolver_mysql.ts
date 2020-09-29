import { EMPTY_LIST_SQL, Placeholders, PLACEHOLDER_REGEXP } from "./core"
import { SqlPlaceholderError } from "./error"

// Name of positional placeholder. MySQL now doesn't support "$i" syntax.
const POSITIONAL_PLACEHOLDER = "?"

export class MySqlPlaceholderResolver {
  private readonly usedNames: string[] = []
  private readonly values: unknown[] = []

  public constructor(
    private readonly placeholders: Placeholders,
  ) {
  }

  public allocScalar(value: unknown): string {
    this.values.push(value)
    return POSITIONAL_PLACEHOLDER
  }

  public allocArray(values: ReadonlyArray<unknown>): string {
    if (values.length === 0) {
      return EMPTY_LIST_SQL
    }

    // Build (?, ?, ?, ...).
    const text = values.map(v => this.allocScalar(v)).join(", ")
    return `(${text})`
  }

  public resolvePlaceholder(name: string): string {
    this.usedNames.push(name)

    const value = this.placeholders[name]
    if (value instanceof Array) {
      return this.allocArray(value)
    }
    return this.allocScalar(value)
  }

  public static resolve(statement: string, placeholders: Placeholders): [string, ReadonlyArray<unknown>] {
    const resolver = new MySqlPlaceholderResolver(placeholders)

    const replacedStatement = statement.replace(
      PLACEHOLDER_REGEXP,
      (_text, name) => resolver.resolvePlaceholder(name),
    )

    const err = SqlPlaceholderError.checkExhaustivity(placeholders, resolver.usedNames)
    if (err != null) {
      throw err
    }

    return [replacedStatement, resolver.values]
  }
}
