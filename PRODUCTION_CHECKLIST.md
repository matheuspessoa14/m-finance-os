# Checklist antes de GitHub + Vercel

## Já implementado no código

- [x] Confirmação antes de excluir registros
- [x] Toasts de sucesso, erro e informação
- [x] Onboarding para usuário sem dados
- [x] Tela Minha conta
- [x] Exportação mensal CSV
- [x] Histórico mensal
- [x] Parcelas pagas por mês (`paidMonths`)
- [x] Código dividido em components/pages/hooks/services/utils
- [x] PWA com ícones e service worker
- [x] Página de privacidade
- [x] Exclusão de conta + dados
- [x] App Check preparado no frontend
- [x] Firestore Rules com isolamento por UID e validação de campos

## Ações manuais no Firebase

1. **Firestore → Regras**
   - revisar e publicar o conteúdo de `firestore.rules`;
   - testar cadastro, edição, marcar parcela paga e exclusão.

2. **Authentication → Settings → Authorized domains**
   - manter `localhost` para desenvolvimento;
   - depois do deploy, adicionar o domínio `*.vercel.app` do projeto.

3. **App Check**
   - configurar o aplicativo Web no Firebase App Check;
   - obter a chave do provedor Web compatível;
   - adicionar `VITE_FIREBASE_APPCHECK_SITE_KEY` ao `.env` local e às variáveis da Vercel;
   - testar primeiro sem enforcement;
   - somente depois, se tudo estiver funcionando, ativar enforcement para Firestore.

## Antes do GitHub

- [ ] confirmar que `.env` está ignorado pelo Git;
- [ ] nunca versionar chave privada de Service Account;
- [ ] rodar `npm run build`;
- [ ] testar desktop e mobile;
- [ ] testar com uma segunda conta Google.

## Depois da Vercel

- [ ] adicionar domínio da Vercel aos Authorized domains do Firebase Auth;
- [ ] testar login Google na URL pública;
- [ ] testar PWA pelo celular real;
- [ ] testar exportação CSV;
- [ ] testar exclusão de conta com uma conta de teste;
- [ ] acompanhar Firestore → Uso para permanecer dentro das cotas do Spark.
