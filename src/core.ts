/**
 * Pattern of named placeholder.
 */
export const PLACEHOLDER_REGEXP: RegExp = /:(\w+)/g

/**
 * Since empty list `()` is illegal in SQL, use this sub-query that returns zero rows instead.
 *
 * Note that this doesn't work with legacy MySQL (< 5.6), where from clause is mandatory.
 */
export const EMPTY_LIST_SQL = "(select 0 where 0 = 1)"

export type Placeholders = Readonly<Record<string, unknown>>

export type PlaceholderNames = ReadonlyArray<string>
