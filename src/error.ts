// Define error type and shared error checking / message building logic.

import { PlaceholderNames, Placeholders } from "./core"

export class SqlPlaceholderError extends Error {
  public constructor (
    public readonly message: string,
    public readonly undefinedNames: PlaceholderNames,
    public readonly unusedNames: PlaceholderNames,
  ) {
    super(message)
  }

  public static create(undefinedNames: PlaceholderNames, unusedNames: PlaceholderNames): SqlPlaceholderError | null {
    let ok = true
    let messages = []

    if (undefinedNames.length !== 0) {
      ok = false
      messages.push(`SQL placeholders '${undefinedNames.join("', '")}' are used in SQL statement but value not given.`)
    }

    if (unusedNames.length !== 0) {
      ok = false
      messages.push(`SQL placeholders '${unusedNames.join("', '")}' are given but didn't appear in SQL statement.`)
    }

    return ok ? null : new SqlPlaceholderError(messages.join(" "), undefinedNames, unusedNames)
  }

  public static checkExhaustivity(placeholders: Placeholders, usedNames: PlaceholderNames): SqlPlaceholderError | null {
    const definedNames = Object.keys(placeholders)
    usedNames = [...new Set(usedNames)] // remove duplicated items

    const undefinedNames = usedNames.filter(name => !definedNames.includes(name))
    const unusedNames = definedNames.filter(name => !usedNames.includes(name))
    return SqlPlaceholderError.create(undefinedNames, unusedNames)
  }
}
