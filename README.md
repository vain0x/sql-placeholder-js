# SQL Placeholder

Convert named placeholder to positional ones.

## What?

From a SQL using named placeholders (`:placeholder`):

```sql
select user_id, username
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

To a sql using positional placeholders (`?` in MySQL or `$i` in Postgres):

```sql
select user_id, username
from users
where user_id in (?, ?, ?)
    and birthdate = ?
```

with an array of values:

```js
    [2, 3, 5, "2001-02-03"]
```

## Usage

```ts
import   { MySqlPlaceholderResolver } from "sql-placeholder-js"
// Or { PostgresPlaceholderResolver }

const sql = "select ..."
const params = { user_id: 2 }

const [statement, values] = MySqlPlaceholderResolver.resolve(sql, params))
//                    Or PostgresPlaceholderResolver
```

## Checking

Use of *undefined* placeholder is an error. And definition of unused placeholder is also an error.

```ts
// ✗ Exception thrown for use of undefined placeholder `:user_id`
MySqlPlaceholderResolver.resolve(
    "select username from users where user_id = :user_id",
    {
        // user_id: ...
    }))
```

```ts
// ✗ Exception thrown for definition of unused placeholder `:user_id`
MySqlPlaceholderResolver.resolve(
    "delete from users",
    {
        user_id: 42,
    }))
```
