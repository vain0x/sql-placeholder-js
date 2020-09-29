import { EMPTY_LIST_SQL, PlaceholderNames, Placeholders, PLACEHOLDER_REGEXP } from "./core"
import { SqlPlaceholderError } from "./error"

/**
 * Get name of i'th positional placeholder.
 */
const positionalPlaceholderName = (i: number): string => "$" + (i + 1)

export class PostgresPlaceholderResolver {
  private readonly memo = new Map<string, string>()
  private readonly values: unknown[] = []

  public constructor(
    private readonly placeholders: Placeholders,
  ) {
  }

  public usedNames(): PlaceholderNames {
    return [...this.memo.keys()]
  }

  public allocScalar(value: unknown): string {
    const i = this.values.length
    this.values.push(value)
    return positionalPlaceholderName(i)
  }

  public allocArray(values: ReadonlyArray<unknown>): string {
    if (values.length === 0) {
      return EMPTY_LIST_SQL
    }

    const offset = this.values.length
    this.values.push(...values)

    // Build ($1, $2, ...).
    const text = values.map((_, i) => positionalPlaceholderName(offset + i)).join(", ")
    return `(${text})`
  }

  public resolvePlaceholder(name: string): string {
    let text = this.memo.get(name)
    if (text !== undefined) {
      return text
    }

    const value = this.placeholders[name]
    if (value instanceof Array) {
      text = this.allocArray(value)
    } else {
      text = this.allocScalar(value)
    }

    this.memo.set(name, text)
    return text
  }

  public static resolve(statement: string, placeholders: Placeholders): [string, ReadonlyArray<unknown>] {
    const resolver = new PostgresPlaceholderResolver(placeholders)

    const replacedStatement = statement.replace(
      PLACEHOLDER_REGEXP,
      (_text, name) => resolver.resolvePlaceholder(name),
    )

    const err = SqlPlaceholderError.checkExhaustivity(placeholders, resolver.usedNames())
    if (err != null) {
      throw err
    }

    return [replacedStatement, resolver.values]
  }
}
