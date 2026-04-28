import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getMessages } from "@/lib/i18n";

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    q: "O que é esse projeto?",
    a: (
      <>
        É um <strong>bolão corporativo open-source</strong> da Copa do Mundo FIFA 2026,
        construído com vibe-coding (colaboração entre desenvolvedor e LLM). Faz parte de um
        ciclo de <strong>12 projetos open-source</strong> que serão desenvolvidos ao longo
        de <strong>2026</strong> — um por mês — explorando arquiteturas, domínios e
        diferentes formas de usar IA no desenvolvimento de software. Tudo gratuito,
        auto-hospedável e licenciado para uso e modificação livres. Mais detalhes em{" "}
        <Link href="/sobre" className="text-brand-accent hover:underline">/sobre</Link>.
      </>
    ),
  },
  {
    q: "Como funciona um bolão da Copa do Mundo?",
    a: (
      <>
        Antes de cada jogo começar, você palpita o <strong>placar</strong>. Quando a partida
        termina, o sistema compara seu palpite com o resultado real e te dá pontos: 3 por
        placar exato, 1 por acertar quem ganhou (ou empate) com placar errado, 0 por errar.
        Quem somar mais pontos no fim do torneio leva o prêmio. Os critérios completos estão em{" "}
        <Link href="/regras" className="text-brand-accent hover:underline">/regras</Link>.
      </>
    ),
  },
  {
    q: "Quanto custa para usar?",
    a: (
      <>
        Nada. O código é MIT, a infraestrutura cabe no <strong>free tier do Cloudflare</strong>{" "}
        para empresas com até alguns milhares de funcionários. Empresas maiores podem precisar
        de plano de email pago (~US$ 20/mês), mas tudo é configurável.
      </>
    ),
  },
  {
    q: "A plataforma envolve dinheiro ou aposta?",
    a: (
      <>
        Não. O sistema <strong>nunca movimenta dinheiro</strong>. Premiações são
        definidas e entregues pela empresa fora do sistema, como ação de endomarketing.
        Apostas financeiras são proibidas tanto na UI quanto nos termos de uso.
      </>
    ),
  },
  {
    q: "Quem pode entrar no bolão?",
    a: (
      <>
        Apenas pessoas com email do domínio corporativo configurado pelo administrador.
        O login é por <strong>magic link</strong> (sem senha) — você digita o email,
        recebe um link e acessa direto. Nada de cadastro com senha.
      </>
    ),
  },
  {
    q: "Posso editar meu palpite depois de salvar?",
    a: (
      <>
        Pode, livremente, <strong>até 15 minutos antes do início do jogo</strong>. Depois disso,
        o palpite trava automaticamente e qualquer alteração é bloqueada. O sistema salva
        sozinho conforme você digita — sem botão &quot;salvar&quot;.
      </>
    ),
  },
  {
    q: "Existem palpites especiais além dos jogos?",
    a: (
      <>
        Sim — campeão, vice, 3º lugar, artilheiro, primeira eliminada e seleção surpresa.
        Eles travam quando o <strong>primeiro jogo</strong> da Copa começa.
      </>
    ),
  },
  {
    q: "Posso disputar com um grupo menor de colegas?",
    a: (
      <>
        Sim. Crie um <strong>grupo privado</strong> com nome e descrição, e compartilhe o
        código de convite com quem quiser. Cada grupo tem seu próprio ranking interno,
        sem impactar o ranking geral do bolão.
      </>
    ),
  },
  {
    q: "E se a API de resultados der problema durante um jogo importante?",
    a: (
      <>
        Existem dois fallbacks: a admin pode <strong>editar o resultado manualmente</strong>{" "}
        no painel ou forçar um recálculo. A pontuação é refeita automaticamente após
        a correção.
      </>
    ),
  },
  {
    q: "Meus dados ficam seguros?",
    a: (
      <>
        O projeto é <strong>LGPD-ready</strong>: você pode exportar todos os seus dados em
        JSON ou excluir sua conta a qualquer momento na página de perfil. Logs de IP são
        armazenados em hash, e dados nunca cruzam entre instâncias (cada empresa tem a
        sua cópia isolada).
      </>
    ),
  },
];

export default async function LandingPage() {
  const session = await getCurrentSession();
  if (session) redirect("/home");

  const m = await getMessages();
  const t = m.landing;

  return (
    <main className="min-h-screen bg-brand-surface text-brand-text">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, hsl(var(--brand-primary)) 0%, transparent 40%), radial-gradient(circle at 80% 80%, hsl(var(--brand-accent)) 0%, transparent 40%)",
          }}
          aria-hidden
        />
        <div className="relative container py-16 md:py-28 max-w-4xl">
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary/20 text-xs font-mono uppercase tracking-wider">
                {t.badge}
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[0.95]">
              {t.titleLine1}<br />
              {t.titleLine2}<br />
              <span className="text-brand-primary">{t.titleLine3}</span>
            </h1>

            <p className="text-lg md:text-xl text-brand-text-muted max-w-2xl">{t.description}</p>

            <div className="flex flex-wrap gap-3 items-center">
              <Link href="/login">
                <Button size="lg" className="text-base px-6">{t.enter}</Button>
              </Link>
              <Link href="/regras">
                <Button size="lg" variant="outline" className="text-base px-6">{t.howItWorks}</Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-3xl">
              <Feature title={t.features.predictionsTitle} description={t.features.predictionsDesc} />
              <Feature title={t.features.rankingTitle} description={t.features.rankingDesc} />
              <Feature title={t.features.specialsTitle} description={t.features.specialsDesc} />
              <Feature title={t.features.remindersTitle} description={t.features.remindersDesc} />
            </div>
          </div>
        </div>
      </section>

      <section className="container max-w-3xl py-12 md:py-20" id="faq">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Perguntas frequentes</h2>
        <p className="text-brand-text-muted mb-8">
          O que costumam perguntar sobre o bolão e sobre o projeto.
        </p>
        <div className="space-y-2">
          {FAQS.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-brand-border bg-brand-card overflow-hidden"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-5 py-4 hover:bg-brand-surface transition-colors">
                <span className="font-medium text-base">{item.q}</span>
                <span className="text-xl text-brand-text-muted group-open:rotate-45 transition-transform shrink-0">+</span>
              </summary>
              <div className="px-5 pb-5 pt-0 text-sm text-brand-text-muted leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-brand-border bg-brand-card">
        <div className="container max-w-4xl py-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm text-brand-text-muted">
          <div>
            Bolão Copa do Mundo 2026 · open-source · MIT + CC BY 4.0
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/regras" className="hover:text-brand-primary">Como funciona</Link>
            <Link href="/sobre" className="hover:text-brand-primary">Sobre</Link>
            <Link href="/privacidade" className="hover:text-brand-primary">Privacidade</Link>
            <Link href="/termos" className="hover:text-brand-primary">Termos</Link>
            <Link href="/login" className="hover:text-brand-primary">Entrar</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card p-4">
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-brand-text-muted mt-1">{description}</div>
    </div>
  );
}
