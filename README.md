# SQL Placeholder

[![NPM](https://nodei.co/npm/sql-placeholder-js.png?mini=true)](https://npmjs.org/package/sql-placeholder-js)

Convert SQL placeholders from named ones (`:n`) to positional ones (`$i` in postgres or `?` in MySQL). Array expansion and exhaustivity checking are also supported.

## Install

```sh
npm install sql-placeholder-js
```

## What?

From a SQL using named placeholders (`:n`):

```sql
select user_id, name
from users
where user_id in :user_ids
    and birthdate = :birthdate
```

with an object of values:

```js
    {
        user_ids: [2, 3, 5],
        birthdate: "2001-02-03",
    }
```

To a sql using positional placeholders (`$i`):

```sql
select user_id, name
from users
where user_id in ($1, $2, $3)
    and birthdate = $4
```

with an array of values:

```js
    [2, 3, 5, "2001-02-03"]
```

## Usage

```ts
import{ PostgresPlaceholderResolver } from "sql-placeholder-js"
// Or    { MySqlPlaceholderResolver }

const sql = "select name from users where user_id = :user_id"
const params = { user_id: 2 }

const [statement, values] = PostgresPlaceholderResolver.resolve(sql, params))
//                          Or MySqlPlaceholderResolver
```

## Checking

Use of undefined placeholder is an error.

```ts
// ✗ Exception thrown for use of undefined placeholder `:user_id`
MySqlPlaceholderResolver.resolve(
    "select username from users where user_id = :user_id",
    {
        // user_id: ...
    }))
```

Definition of unused placeholder is also an error.

```ts
// ✗ Exception thrown for definition of unused placeholder `:user_id`
MySqlPlaceholderResolver.resolve(
    "delete from users",
    {
        user_id: 42,
    }))
```

## Notes

- SQL statement is not tokenized but placeholders are just replaced with simple regexp. Comments or quotes including `:` doesn't work correctly.
