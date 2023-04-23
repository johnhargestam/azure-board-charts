export default async function () {
  await globalThis.__DOCKERCOMPOSE__.down();
}
