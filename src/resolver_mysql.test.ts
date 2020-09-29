import { deepStrictEqual as assertEq, throws } from "assert"
import { MySqlPlaceholderResolver } from "./resolver_mysql"

declare const describe: (title: string, callback: () => void) => void
declare const it: (title: string, callback: () => void) => void

// Errors are tested in postgres version more.

describe("resolver_mysql", () => {
  it("works in basic case", () => {
    const template = "select * from users where user_id = :user_id"
    const expected = "select * from users where user_id = ?"
    const [statement, values] = MySqlPlaceholderResolver.resolve(template, {
      user_id: 42,
    })

    assertEq(statement, expected)
    assertEq(values, [42])
  })

  it("works with array values", () => {
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
      where user_id in (?, ?)
          or name in (?, ?)
          or birthdate = ?
    `
    const [statement, values] = MySqlPlaceholderResolver.resolve(template, {
      user_ids: [6, 8],
      names: ["Jane", "John"],
      birthdate: "2001-02-03",
    })
    assertEq(statement, expected)
    assertEq(values, [6, 8, "Jane", "John", "2001-02-03"])
  })

  describe("error cases", () => {
    it("throws if some placeholder is undefined", () => {
      throws(() => MySqlPlaceholderResolver.resolve(
        "select name from users where user_id = :user_id",
        {},
      ))
    })

    it("throws if some placeholder is unused", () => {
      throws(() => MySqlPlaceholderResolver.resolve(
        "delete from users",
        { user_id: 42 },
      ))
    })
  })
})
