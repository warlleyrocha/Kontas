# Tech Debt — Feature Accounts

## TD-001: `findAccountInCache` usa queryKey muito amplo

**Arquivo:** `useAccountQueries.ts:41`

**Problema:**
```typescript
const queries = queryClient.getQueriesData<Conta[]>({
  queryKey: accountKeys.all, // ["accounts"]
});
```

Itera sobre TODAS as queries que começam com `["accounts"]`, incluindo `byRepublic` e `byResident`. Para o tamanho atual do app é aceitável, mas se o usuário tiver muitas republics no cache, cada chamada de `findAccountInCache` (usada por 3 mutations) itera desnecessariamente sobre todo o cache de accounts.

**Impacto:** Performance (baixo no momento, mas escala linearmente com o número de republics em cache)

**Sugestão de fix:** Usar um Map em memória ou restringir a busca a `accountKeys.byRepublic(republicId)` quando o `republicId` for conhecido.

---

## TD-002: Duplicação de pattern de queries entre `usePayments` e `useAccountList`

**Arquivos:** `usePayments.ts`, `useAccountList/index.ts`

**Problema:**
Ambos os hooks replicam o mesmo pattern:
```typescript
const accountsQuery = useAccountsByRepublicQuery(republicId);
const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data]);
const accountIds = useMemo(() => accounts.map((a) => a.id), [accounts]);
const residentQueries = useAccountResidentsByAccountQueries(accountIds);
```

**Impacto:** Manutenibilidade — se o pattern mudar, precisa atualizar em 2+ lugares.

**Sugestão de fix:** Extrair hook compartilhado:
```typescript
function useAccountsAndResidents(republicId: string) {
  const accountsQuery = useAccountsByRepublicQuery(republicId);
  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data]);
  const accountIds = useMemo(() => accounts.map((a) => a.id), [accounts]);
  const residentQueries = useAccountResidentsByAccountQueries(accountIds);
  return { accountsQuery, accounts, accountIds, residentQueries };
}
```
