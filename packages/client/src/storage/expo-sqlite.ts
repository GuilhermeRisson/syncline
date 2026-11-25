/*
 * GUIA (semana 4, só quando for montar o app de exemplo)
 * --------------------------------------------------------------------------
 * A mesma coisa que better-sqlite.ts, mas com expo-sqlite, para rodar no
 * celular. Copie o SQL do better-sqlite.ts e troque as chamadas:
 *   better-sqlite3            expo-sqlite
 *   db.prepare(sql).get(...)  await db.getFirstAsync(sql, ...)
 *   db.prepare(sql).all(...)  await db.getAllAsync(sql, ...)
 *   db.prepare(sql).run(...)  await db.runAsync(sql, ...)
 *   BEGIN/COMMIT              await db.withTransactionAsync(fn)
 *
 * Por enquanto o arquivo fica vazio de propósito: o expo-sqlite só funciona
 * dentro de um app Expo, então ele não é testado aqui no Node.
 */
export {};
