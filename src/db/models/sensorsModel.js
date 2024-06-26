import { queryWrapper } from '../../utils/dbTools.js'

const sensorModel = (db) => {
  const tableName = 'sensors'
  const actionTableName = 'actions'

  db.exec(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      actionId NUMBER NOT NULL,
      status BOOLEAN NOT NULL,
      lastActiveAt DATETIME,
      FOREIGN KEY (actionId) REFERENCES ${actionTableName}(id) ON DELETE CASCADE
    )  
  `)

  return {
    create: ({ name, actionId }) => {
      return queryWrapper(() => {
        const createQuery = db.prepare(
          `INSERT INTO ${tableName} (name, actionId, status) VALUES (?, ?, 0);`
        )
        db.transaction(() => {
          createQuery.run(name, actionId)
        })()
      })
    },
    createWithId: ({ id, name, actionId }) => {
      return queryWrapper(() => {
        const createQuery = db.prepare(
          `INSERT INTO ${tableName} (id, name, actionId, status) VALUES (?, ?, ?, 0);`
        )
        db.transaction(() => {
          createQuery.run(id, name, actionId)
        })()
      })
    },
    getAll: () => {
      return queryWrapper(() => {
        const query = `SELECT * FROM ${tableName};`
        const data = db.prepare(query).all()
        return data
      })
    },
    getById: (id) => {
      return queryWrapper(() => {
        const query = `SELECT * FROM ${tableName} WHERE id = ?;`
        const data = db.prepare(query).get(id)
        return data
      })
    },
    getByName: (name) => {
      return queryWrapper(() => {
        const query = `SELECT * FROM ${tableName} WHERE name = ?;`
        const result = db.prepare(query).get(name)
        return result
      })
    },
    deleteAll: () => {
      return queryWrapper(() => {
        const query = db.prepare(`DELETE FROM ${tableName};`)
        db.transaction(() => {
          query.run()
        })()
      })
    },
    deleteById: (id) => {
      return queryWrapper(() => {
        const query = `DELETE FROM ${tableName} WHERE id = ?`
        const result = db.prepare(query).run(id)
        const isDeleted = result.changes === 1
        return isDeleted
      })
    },
    changeStatus: ({ id, status }) => {
      return queryWrapper(() => {
        let updateQuery = ''
        if (status) {
          updateQuery = db.prepare(
            `UPDATE ${tableName} SET status = ?, lastActiveAt = CURRENT_TIMESTAMP WHERE id = ?;`
          )
        } else {
          updateQuery = db.prepare(
            `UPDATE ${tableName} SET status = ? WHERE id = ?;`
          )
        }
        db.transaction(() => {
          updateQuery.run(status, id)
        })()
      })
    }
  }
}

export default sensorModel
