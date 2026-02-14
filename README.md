# Hooks API Boundary

`public.ts` files are domain boundaries, not internal barrels.

## Rules

- `src/hooks/index.ts` is the only cross-domain entrypoint (`export * from "./<domain>/public"`).
- `src/hooks/<domain>/public.ts` only exports externally consumed contracts.
- `src/app` must import from `@hooks` only, never `@hooks/<domain>/...`.
- Service domains (`auth`, `authz`, `chat`, `class`) must provide one aggregate `interface/*DomainInterface.ts`.
- Domain `queries` and `flow` should depend on domain interfaces, not direct service implementation files.
- Query/Mutation hooks use explicit suffixes: `*Query` / `*Mutation`.
- Do not add compatibility aliases like `useX = useXQuery` or `createX as useX`.
- Internal layers (`states/`, `flow/`, `services/`, low-level `queries/`) are private by default.
