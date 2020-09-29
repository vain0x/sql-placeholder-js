import { deepStrictEqual as assertEq, throws } from "assert"
import { SqlPlaceholderError } from "./error"
import { PostgresPlaceholderResolver } from "./resolver_postgres"

declare const describe: (title: string, callback: () => void) => void
declare const it: (title: string, callback: () => void) => void

describe("resolver_postgres", () => {
  it("works in basic case", () => {
    const template = "select * from users where user_id = :user_id"
    const expected = "select * from users where user_id = $1"
    const [statement, values] = PostgresPlaceholderResolver.resolve(template, {
      user_id: 42,
    })

    assertEq(statement, expected)
    assertEq(values, [42])
  })

  it("reuses the same value for same placeholder", () => {
    const template = `
      select user_id
      from users
      where (:name is null or name = :name)
          and (:birthdate is null or birthdate = :birthdate)
    `
    const expected = `
      select user_id
      from users
      where ($1 is null or name = $1)
          and ($2 is null or birthdate = $2)
    `
    const [statement, values] = PostgresPlaceholderResolver.resolve(template, {
      name: "john",
      birthdate: "2001-02-03",
    })
    assertEq(statement, expected)
    assertEq(values, ["john", "2001-02-03"])
  })

  describe("use of array values", () => {
    it("expands empty array value", () => {
      const template = `
        select user_id, name
        from users
        where user_id in :user_ids
      `
      const expected = `
        select user_id, name
        from users
        where user_id in (select 0 where 0 = 1)
      `
      const [statement, values] = PostgresPlaceholderResolver.resolve(template, {
        user_ids: [],
      })
      assertEq(statement, expected)
      assertEq(values, [])
    })

    it("expands array value with length 3", () => {
      const template = `
        select user_id, name
        from users
        where user_id in :user_ids
      `
      const expected = `
        select user_id, name
        from users
        where user_id in ($1, $2, $3)
      `
      const [statement, values] = PostgresPlaceholderResolver.resolve(template, {
        user_ids: [2, 3, 5],
      })
      assertEq(statement, expected)
      assertEq(values, [2, 3, 5])
    })

    it("expands multiple array values", () => {
      const template = `
        select user_id, name
        from users
        where user_id in :user_ids
            or name in :names
            or birthdate = :birthdate
      `
      const expected = `
        select user_id, name
        from users
        where user_id in ($1, $2)
            or name in ($3, $4)
            or birthdate = $5
      `
      const [statement, values] = PostgresPlaceholderResolver.resolve(template, {
        user_ids: [6, 8],
        names: ["Jane", "John"],
        birthdate: "2001-02-03",
      })
      assertEq(statement, expected)
      assertEq(values, [6, 8, "Jane", "John", "2001-02-03"])
    })
  })

  describe("error cases", () => {
    it("throws if undefined placeholder is used", () => {
      throws(() => PostgresPlaceholderResolver.resolve(
        "select user_id from users where user_id = :user_id",
        {}
      ), (err: SqlPlaceholderError) =>
        err.message.includes("value not given")
        && err.undefinedNames.includes("user_id")
      )
    })

    it("throws if a placeholder is specified but not used", () => {
      throws(() => PostgresPlaceholderResolver.resolve(
        "delete from users",
        { user_id: 42 }
      ), (err: SqlPlaceholderError) =>
        err.message.includes("didn't appear")
        && err.unusedNames.includes("user_id")
      )
    })

    it("throws if some placeholder is undefined and some is unused", () => {
      throws(() => PostgresPlaceholderResolver.resolve(
        "select user_id from users where user_id in :user_ids and birthdate = :birthdate",
        { user_id: 42, birthdate: "2001-02-03", role: "GUEST" }
      ), (err: SqlPlaceholderError) =>
        err.message.includes("value not given")
        && err.message.includes("didn't appear")
        && err.undefinedNames.includes("user_ids")
        && err.unusedNames.includes("user_id")
        && err.unusedNames.includes("role")
      )
    })
  })
})
