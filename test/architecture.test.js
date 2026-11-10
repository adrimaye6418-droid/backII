import {
  describe,
  expect,
  test,
} from "@jest/globals";

import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";

import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile =
  fileURLToPath(import.meta.url);

const currentDirectory =
  path.dirname(currentFile);

const projectRoot =
  path.resolve(
    currentDirectory,
    ".."
  );

const srcDirectory =
  path.join(
    projectRoot,
    "src"
  );

const readFile = (filePath) => {
  return readFileSync(
    filePath,
    "utf8"
  );
};

const getJavaScriptFiles = (
  directoryPath
) => {
  if (!existsSync(directoryPath)) {
    return [];
  }

  const entries =
    readdirSync(
      directoryPath,
      {
        withFileTypes: true,
      }
    );

  return entries.flatMap(
    (entry) => {
      const fullPath =
        path.join(
          directoryPath,
          entry.name
        );

      if (entry.isDirectory()) {
        return getJavaScriptFiles(
          fullPath
        );
      }

      if (
        entry.isFile() &&
        entry.name.endsWith(".js")
      ) {
        return [fullPath];
      }

      return [];
    }
  );
};

const getRelativePath = (
  filePath
) => {
  return path
    .relative(
      projectRoot,
      filePath
    )
    .replaceAll("\\", "/");
};

const findFilesContaining = (
  directoryPath,
  patterns
) => {
  const files =
    getJavaScriptFiles(
      directoryPath
    );

  return files
    .filter((filePath) => {
      const content =
        readFile(filePath);

      return patterns.some(
        (pattern) =>
          pattern.test(content)
      );
    })
    .map(getRelativePath);
};

describe(
  "Arquitectura en capas",
  () => {
    test(
      "existen los DAO principales",
      () => {
        const expectedFiles = [
          "src/dao/user.dao.js",
          "src/dao/event.dao.js",
          "src/dao/ticket.dao.js",
        ];

        expectedFiles.forEach(
          (relativePath) => {
            const fullPath =
              path.join(
                projectRoot,
                relativePath
              );

            expect(
              existsSync(fullPath)
            ).toBe(true);
          }
        );
      }
    );

    test(
      "existen los repositories principales",
      () => {
        const expectedFiles = [
          "src/repositories/users.repository.js",
          "src/repositories/events.repository.js",
          "src/repositories/tickets.repository.js",
        ];

        expectedFiles.forEach(
          (relativePath) => {
            const fullPath =
              path.join(
                projectRoot,
                relativePath
              );

            expect(
              existsSync(fullPath)
            ).toBe(true);
          }
        );
      }
    );

    test(
      "existen los DTO principales",
      () => {
        const expectedFiles = [
          "src/dto/user.dto.js",
          "src/dto/event.dto.js",
          "src/dto/ticket.dto.js",
        ];

        expectedFiles.forEach(
          (relativePath) => {
            const fullPath =
              path.join(
                projectRoot,
                relativePath
              );

            expect(
              existsSync(fullPath)
            ).toBe(true);
          }
        );
      }
    );

    test(
      "los repositories no importan modelos",
      () => {
        const repositoriesDirectory =
          path.join(
            srcDirectory,
            "repositories"
          );

        const invalidFiles =
          findFilesContaining(
            repositoriesDirectory,
            [
              /from\s+["'][^"']*models\//,
              /import\s*\(\s*["'][^"']*models\//,
            ]
          );

        expect(
          invalidFiles
        ).toEqual([]);
      }
    );

    test(
      "los services no importan modelos ni DAO",
      () => {
        const servicesDirectory =
          path.join(
            srcDirectory,
            "services"
          );

        const invalidFiles =
          findFilesContaining(
            servicesDirectory,
            [
              /from\s+["'][^"']*models\//,
              /from\s+["'][^"']*dao\//,
              /import\s*\(\s*["'][^"']*models\//,
              /import\s*\(\s*["'][^"']*dao\//,
            ]
          );

        expect(
          invalidFiles
        ).toEqual([]);
      }
    );

    test(
      "los controllers no importan modelos, DAO ni repositories",
      () => {
        const controllersDirectory =
          path.join(
            srcDirectory,
            "controllers"
          );

        const invalidFiles =
          findFilesContaining(
            controllersDirectory,
            [
              /from\s+["'][^"']*models\//,
              /from\s+["'][^"']*dao\//,
              /from\s+["'][^"']*repositories\//,
              /import\s*\(\s*["'][^"']*models\//,
              /import\s*\(\s*["'][^"']*dao\//,
              /import\s*\(\s*["'][^"']*repositories\//,
            ]
          );

        expect(
          invalidFiles
        ).toEqual([]);
      }
    );

    test(
      "las rutas no importan modelos, DAO ni repositories",
      () => {
        const routesDirectory =
          path.join(
            srcDirectory,
            "routes"
          );

        const invalidFiles =
          findFilesContaining(
            routesDirectory,
            [
              /from\s+["'][^"']*models\//,
              /from\s+["'][^"']*dao\//,
              /from\s+["'][^"']*repositories\//,
              /import\s*\(\s*["'][^"']*models\//,
              /import\s*\(\s*["'][^"']*dao\//,
              /import\s*\(\s*["'][^"']*repositories\//,
            ]
          );

        expect(
          invalidFiles
        ).toEqual([]);
      }
    );

    test(
      "config no importa modelos de Mongoose",
      () => {
        const configDirectory =
          path.join(
            srcDirectory,
            "config"
          );

        const invalidFiles =
          findFilesContaining(
            configDirectory,
            [
              /from\s+["'][^"']*models\//,
              /import\s*\(\s*["'][^"']*models\//,
            ]
          );

        expect(
          invalidFiles
        ).toEqual([]);
      }
    );

    test(
      "solo los DAO importan modelos directamente",
      () => {
        const allSourceFiles =
          getJavaScriptFiles(
            srcDirectory
          );

        const modelImportingFiles =
          allSourceFiles
            .filter((filePath) => {
              const content =
                readFile(filePath);

              return (
                /from\s+["'][^"']*models\//.test(
                  content
                ) ||
                /import\s*\(\s*["'][^"']*models\//.test(
                  content
                )
              );
            })
            .map(getRelativePath);

        const invalidFiles =
          modelImportingFiles.filter(
            (filePath) =>
              !filePath.startsWith(
                "src/dao/"
              )
          );

        expect(
          invalidFiles
        ).toEqual([]);
      }
    );

    test(
      "los repositories utilizan su DAO correspondiente",
      () => {
        const associations = [
          {
            file:
              "src/repositories/users.repository.js",
            expected:
              /from\s+["'][^"']*dao\/user\.dao\.js["']/,
          },
          {
            file:
              "src/repositories/events.repository.js",
            expected:
              /from\s+["'][^"']*dao\/event\.dao\.js["']/,
          },
          {
            file:
              "src/repositories/tickets.repository.js",
            expected:
              /from\s+["'][^"']*dao\/ticket\.dao\.js["']/,
          },
        ];

        associations.forEach(
          ({
            file,
            expected,
          }) => {
            const fullPath =
              path.join(
                projectRoot,
                file
              );

            expect(
              existsSync(fullPath)
            ).toBe(true);

            const content =
              readFile(fullPath);

            expect(
              content
            ).toMatch(expected);
          }
        );
      }
    );

    test(
      "los DTO no declaran el campo password en sus respuestas",
      () => {
        const dtoDirectory =
          path.join(
            srcDirectory,
            "dto"
          );

        const dtoFiles =
          getJavaScriptFiles(
            dtoDirectory
          );

        const invalidFiles =
          dtoFiles
            .filter((filePath) => {
              const content =
                readFile(filePath);

              return (
                /this\.password\s*=/.test(
                  content
                ) ||
                /password\s*:\s*data\.password/.test(
                  content
                )
              );
            })
            .map(getRelativePath);

        expect(
          invalidFiles
        ).toEqual([]);
      }
    );
  }
);