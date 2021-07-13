import { deepStrictEqual as assertEq } from "assert"
import { PLACEHOLDER_REGEXP } from "./core"

declare const describe: (title: string, callback: () => void) => void
declare const it: (title: string, callback: () => void) => void

describe("PLACEHOLDER_REGEXP", () => {
  const r = () => new RegExp(PLACEHOLDER_REGEXP)

  it("matches basic identifier", () => {
    const m = r().exec(":foo")
    assertEq(m?.[1], "foo")
  })

  it("matches identifier with uppercase letters, digits and underscores", () => {
    const m = r().exec(":Pascal_9_8")
    assertEq(m?.[1], "Pascal_9_8")
  })

  it("doesn't match colon-only", () => {
    const m = r().exec(": foo")
    assertEq(m, null)
  })

  it("doesn't match number", () => {
    const m = r().exec("00:01:00")
    assertEq(m, null)
  })

  it("doesn't match non-ascii letter", () => {
    const m = r().exec(":ゆ")
    assertEq(m, null)
  })

  it("doesn't match emoji", () => {
    const m = r().exec(":🐧")
    assertEq(m, null)
  })
})
