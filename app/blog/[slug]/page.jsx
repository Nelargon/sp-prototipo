import { marked } from 'marked';
import { A, Nota } from '../Articulo';
import { css } from '../../css';
import { BP } from '../../basePath';
import { getPublishedPosts, getPost, getRelacionadas, getContextoDeSerie, formatFecha } from '../../../lib/blog';

// Con output:'export' cada slug debe existir en build time, y Next rechaza
// una lista vacía de params: sin notas publicadas se genera una única página
// centinela, así el build queda verde también en ese estado.
export const dynamicParams = false;
const SENTINEL = 'muy-pronto';

export async function generateStaticParams() {
  const posts = getPublishedPosts();
  if (posts.length === 0) return [{ slug: SENTINEL }];
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} · Blog · Salud Protegida`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: { type: 'article', title: post.title, description: post.description, locale: 'es_PY' },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  const serie = post ? getContextoDeSerie(post.slug) : null;

  if (!post) {
    return (
      <div className="body" style={css('min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--sp-navy-deep);padding:24px')}>
        <div style={css('background:#fff;border-radius:18px;padding:44px 32px;text-align:center;max-width:460px')}>
          <h1 className="disp" style={css('font-size:26px;color:var(--sp-navy);margin:0 0 10px')}>Muy pronto</h1>
          <p style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;color:var(--sp-muted);line-height:1.6;margin:0 0 22px')}>Todavía no hay notas publicadas en el blog.</p>
          <a href={`${BP}/blog/`} className="btn-teal" style={css('display:inline-flex;align-items:center;height:46px;padding:0 24px;border-radius:var(--r-sm);background:var(--sp-teal-deep);color:#fff;font-size:14.5px;font-weight:800')}>Ir al blog</a>
        </div>
      </div>
    );
  }

  // Los links internos del markdown se escriben absolutos ("/simulador/");
  // acá reciben el basePath para que funcionen bajo /sp-prototipo en Pages.
  const html = marked.parse(post.content).replaceAll('href="/', `href="${BP}/`);

  // JSON-LD para SEO (queda inerte con noindex; listo para cuando se prenda la
  // indexación — HANDOFF #8b). El schema.org de artículo mejora el rich result.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    articleSection: post.categoria,
    inLanguage: 'es-PY',
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'Salud Protegida' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <A title={post.title} intro={post.intro} minutes={post.minutes} date={formatFecha(post.date)} categoria={post.categoria} slug={post.slug} cover={post.cover} dato={post.cover_dato} relacionadas={getRelacionadas(post.slug, 3, serie?.siguiente ? [serie.siguiente.slug] : [])} serie={serie}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {post.sources.length > 0 && (
        <div style={css('border-top:1px solid var(--sp-line-2);margin-top:30px;padding-top:18px')}>
          <div style={css('font-size:11.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#9A9A9A;margin-bottom:9px')}>Fuentes</div>
          <ul style={css('margin:0;padding-left:18px')}>
            {post.sources.map((s) => (
              <li key={s} style={css('margin-bottom:5px')}><a href={s} target="_blank" rel="noopener" style={css('font-size:13px;color:var(--sp-teal-deep);word-break:break-all')}>{s}</a></li>
            ))}
          </ul>
        </div>
      )}
      {post.nota && <Nota>{post.nota}</Nota>}
      </A>
    </>
  );
}
