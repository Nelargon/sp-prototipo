/* @ds-bundle: {"format":3,"namespace":"SaludProtegidaDesignSystem_40b760","components":[],"sourceHashes":{"export/src/ui_kits/web/Blog.jsx":"445d8d35373e","export/src/ui_kits/web/Components.jsx":"7c67b0db6d07","export/src/ui_kits/web/Portal.jsx":"5e77245b9e01","ui_kits/web/Blog.jsx":"445d8d35373e","ui_kits/web/Components.jsx":"9c54abb2db34","ui_kits/web/Portal.jsx":"122d8a438f54"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SaludProtegidaDesignSystem_40b760 = window.SaludProtegidaDesignSystem_40b760 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// export/src/ui_kits/web/Blog.jsx
try { (() => {
/* Blog page */

const BlogHero = () => /*#__PURE__*/React.createElement("section", {
  style: {
    background: 'var(--navy-50)',
    padding: '72px 40px'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: 1200,
    margin: '0 auto'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--sp-700)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 12
  }
}, "Blog"), /*#__PURE__*/React.createElement("h1", {
  style: {
    fontSize: 44,
    fontWeight: 700,
    color: 'var(--navy-500)',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    marginBottom: 16
  }
}, "Contenido que te acompa\xF1a."), /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 17,
    color: 'var(--gray-body)',
    maxWidth: 640,
    lineHeight: 1.6
  }
}, "Explicamos lo que quer\xE9s entender \u2014 sin jerga m\xE9dica, sin frases vac\xEDas.")));
const BlogCard = ({
  cat,
  title,
  excerpt,
  date,
  read,
  tint
}) => /*#__PURE__*/React.createElement("article", {
  className: "blog-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "thumb",
  style: {
    background: tint
  }
}, /*#__PURE__*/React.createElement("span", null, "[ foto humana \xB7 placeholder ]")), /*#__PURE__*/React.createElement("span", {
  className: "cat"
}, cat), /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("p", {
  className: "excerpt"
}, excerpt), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, date, " \xB7 ", read, " min de lectura"));
const BlogPage = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(BlogHero, null), /*#__PURE__*/React.createElement("section", {
  className: "section",
  style: {
    paddingTop: 56
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "blog-grid"
}, /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Familia \xB7 embarazo",
  title: "Primer trimestre: qu\xE9 estudios hacer y cu\xE1ndo",
  excerpt: "Te contamos paso a paso qu\xE9 esperar, qu\xE9 cubre tu plan y c\xF3mo pedir turno en Lister sin demoras.",
  date: "12 abr 2026",
  read: "6",
  tint: "#E6F7F6"
}), /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Autorizaciones",
  title: "Por qu\xE9 una autorizaci\xF3n puede demorar (y qu\xE9 hacemos nosotros)",
  excerpt: "Mand\xE1s la indicaci\xF3n por WhatsApp y nuestro equipo la revisa con tu prestador. Si algo no entra, te proponemos una alternativa antes de decirte que no.",
  date: "08 abr 2026",
  read: "4",
  tint: "#E6EDF4"
}), /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Bienestar",
  title: "Chequeo anual: los cinco estudios que cambian m\xE1s decisiones",
  excerpt: "No es sobre hacer todos los estudios. Es sobre los que realmente cambian lo que tu m\xE9dico te recomienda.",
  date: "02 abr 2026",
  read: "5",
  tint: "#FFF3E6"
}), /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Adultos mayores",
  title: "Mudanza de obra social a medicina prepaga: qu\xE9 mirar",
  excerpt: "Tres preguntas concretas para no llevarte sorpresas. La primera: \xBFqu\xE9 pasa con los medicamentos cr\xF3nicos?",
  date: "28 mar 2026",
  read: "7",
  tint: "#E6F7F6"
}), /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Lister",
  title: "Tele-triaje: cu\xE1ndo s\xED llamar y cu\xE1ndo ir directo a la guardia",
  excerpt: "Gu\xEDa pr\xE1ctica. Si ten\xE9s dolor en el pecho, NO llam\xE1s \u2014 vas directo. Te explicamos los otros escenarios.",
  date: "22 mar 2026",
  read: "3",
  tint: "#E6EDF4"
}), /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Plan",
  title: "C\xF3mo leer tu plan sin marearte",
  excerpt: "'Lo que incluye' no es 'prestaciones cubiertas'. Te traducimos los t\xE9rminos que importan.",
  date: "15 mar 2026",
  read: "8",
  tint: "#FFF3E6"
}))));
Object.assign(window, {
  BlogHero,
  BlogCard,
  BlogPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "export/src/ui_kits/web/Blog.jsx", error: String((e && e.message) || e) }); }

// export/src/ui_kits/web/Components.jsx
try { (() => {
/* Nav component */
const Nav = ({
  route,
  setRoute
}) => /*#__PURE__*/React.createElement("nav", {
  className: "sp-nav"
}, /*#__PURE__*/React.createElement("a", {
  href: "#",
  className: "brand",
  onClick: e => {
    e.preventDefault();
    setRoute('home');
  }
}, /*#__PURE__*/React.createElement("img", {
  src: window.__resources.isologo04,
  alt: "Salud Protegida"
})), /*#__PURE__*/React.createElement("div", {
  className: "sp-nav-links"
}, /*#__PURE__*/React.createElement("a", {
  href: "#",
  className: route === 'home' ? 'active' : '',
  onClick: e => {
    e.preventDefault();
    setRoute('home');
  }
}, "Inicio"), /*#__PURE__*/React.createElement("a", {
  href: "#",
  className: route === 'planes' ? 'active' : '',
  onClick: e => {
    e.preventDefault();
    setRoute('planes');
  }
}, "Planes"), /*#__PURE__*/React.createElement("a", {
  href: "#",
  onClick: e => e.preventDefault()
}, "Lister"), /*#__PURE__*/React.createElement("a", {
  href: "#",
  className: route === 'blog' ? 'active' : '',
  onClick: e => {
    e.preventDefault();
    setRoute('blog');
  }
}, "Blog"), /*#__PURE__*/React.createElement("a", {
  href: "#",
  onClick: e => e.preventDefault()
}, "Contacto")), /*#__PURE__*/React.createElement("div", {
  className: "sp-nav-cta"
}, /*#__PURE__*/React.createElement("button", {
  className: "btn btn-tertiary btn-sm",
  onClick: () => setRoute('portal')
}, "Mi cuenta"), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-primary btn-sm",
  onClick: () => setRoute('planes')
}, "Cotiz\xE1 tu plan")));

/* Hero — landing */
const Hero = ({
  onPrimary
}) => /*#__PURE__*/React.createElement("section", {
  className: "hero"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "overline"
}, "Medicina prepaga \xB7 desde 2002"), /*#__PURE__*/React.createElement("h1", null, "Cuidamos lo que m\xE1s quer\xE9s."), /*#__PURE__*/React.createElement("p", null, "M\xE1s de 9.100 familias paraguayas ya conf\xEDan en nosotros. Eleg\xED el plan que se adapta a tu familia y te acompa\xF1amos con la red de Lister, nuestro centro m\xE9dico propio."), /*#__PURE__*/React.createElement("div", {
  className: "hero-actions"
}, /*#__PURE__*/React.createElement("button", {
  className: "btn btn-accent",
  onClick: onPrimary
}, "Cotiz\xE1 tu plan"), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-outline-white"
}, "C\xF3mo funciona"))), /*#__PURE__*/React.createElement("div", {
  className: "hero-media"
}, /*#__PURE__*/React.createElement("div", {
  className: "placeholder"
}, "[ Foto humana paraguaya", /*#__PURE__*/React.createElement("br", null), "\u2014 familia en su casa, luz natural ]", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 11,
    opacity: 0.7
  }
}, "placeholder \xB7 pedir a fot\xF3grafo"))));

/* Feature strip — "por qué SP" */
const Features = () => /*#__PURE__*/React.createElement("section", {
  className: "features"
}, /*#__PURE__*/React.createElement("div", {
  className: "features-inner"
}, /*#__PURE__*/React.createElement("div", {
  className: "feature"
}, /*#__PURE__*/React.createElement("div", {
  className: "icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "stethoscope"
})), /*#__PURE__*/React.createElement("h3", null, "Lister, nuestro centro m\xE9dico propio"), /*#__PURE__*/React.createElement("p", null, "Consultas, laboratorio e imagen con copagos m\xE1s bajos. Tele-triaje sin turno para lo urgente.")), /*#__PURE__*/React.createElement("div", {
  className: "feature"
}, /*#__PURE__*/React.createElement("div", {
  className: "icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "message-circle"
})), /*#__PURE__*/React.createElement("h3", null, "Autorizaciones por WhatsApp en 24h"), /*#__PURE__*/React.createElement("p", null, "Mand\xE1s la indicaci\xF3n, revisamos con tu prestador, te avisamos por el mismo chat. Sin colas, sin formularios.")), /*#__PURE__*/React.createElement("div", {
  className: "feature"
}, /*#__PURE__*/React.createElement("div", {
  className: "icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "users"
})), /*#__PURE__*/React.createElement("h3", null, "Una empresa familiar, no un call center"), /*#__PURE__*/React.createElement("p", null, "23 a\xF1os atendiendo en Asunci\xF3n. Respondemos con nombre y apellido, no con n\xFAmero de ticket."))));

/* Plan card */
const PlanCard = ({
  logo,
  desc,
  price,
  features,
  featured,
  onClick
}) => /*#__PURE__*/React.createElement("div", {
  className: `plan-card ${featured ? 'featured' : ''}`,
  onClick: onClick
}, /*#__PURE__*/React.createElement("div", {
  className: "plan-logo"
}, /*#__PURE__*/React.createElement("img", {
  src: logo,
  alt: ""
})), /*#__PURE__*/React.createElement("p", {
  className: "desc"
}, desc), /*#__PURE__*/React.createElement("div", {
  className: "price"
}, /*#__PURE__*/React.createElement("span", {
  className: "amount"
}, "\u20B2 ", price), /*#__PURE__*/React.createElement("span", {
  className: "per"
}, "/ mes \xB7 titular")), /*#__PURE__*/React.createElement("ul", null, features.map((f, i) => /*#__PURE__*/React.createElement("li", {
  key: i
}, f))), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-outline",
  style: {
    marginTop: 8,
    width: '100%',
    justifyContent: 'center'
  }
}, "Ver detalle"));

/* Plans section */
const PlansSection = ({
  onSelect
}) => /*#__PURE__*/React.createElement("section", {
  className: "section"
}, /*#__PURE__*/React.createElement("div", {
  className: "section-header"
}, /*#__PURE__*/React.createElement("div", {
  className: "overline"
}, "Planes"), /*#__PURE__*/React.createElement("h2", null, "Eleg\xED el plan que encaja con tu familia"), /*#__PURE__*/React.createElement("p", null, "Cuatro planes principales. Cambi\xE1s cuando tu realidad cambia \u2014 no hay letra chica ni permanencia m\xEDnima.")), /*#__PURE__*/React.createElement("div", {
  className: "plans-grid"
}, /*#__PURE__*/React.createElement(PlanCard, {
  logo: window.__resources.plan03,
  desc: "Lo esencial, sin copagos sorpresa. Ideal para empezar.",
  price: "320.000",
  features: ['Consultas Lister', 'Laboratorio básico', 'WhatsApp 24h', 'Tele-triaje'],
  onClick: () => onSelect('Previsor')
}), /*#__PURE__*/React.createElement(PlanCard, {
  logo: window.__resources.plan04,
  desc: "Cobertura amplia con medicamentos con descuento.",
  price: "480.000",
  features: ['Todo de Previsor', 'Medicamentos 40% off', 'Imagen simple', 'Hospitalización regional'],
  onClick: () => onSelect('Primordial')
}), /*#__PURE__*/React.createElement(PlanCard, {
  logo: window.__resources.plan02,
  desc: "Cobertura completa para vos y tu familia, con 50+ prestadores.",
  price: "720.000",
  featured: true,
  features: ['Todo de Primordial', 'Red completa 50+', 'Alta complejidad', 'Maternidad', 'Cobertura nacional'],
  onClick: () => onSelect('Integral')
}), /*#__PURE__*/React.createElement(PlanCard, {
  logo: window.__resources.plan05,
  desc: "Tope alto y cobertura internacional regional.",
  price: "1.180.000",
  features: ['Todo de Integral', 'Habitación privada', 'Cobertura MERCOSUR', 'Consulta domiciliaria'],
  onClick: () => onSelect('Superior')
})));

/* CTA banner */
const CtaBanner = ({
  onClick
}) => /*#__PURE__*/React.createElement("div", {
  className: "cta-banner"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "\xBFNo sab\xE9s qu\xE9 plan te conviene?"), /*#__PURE__*/React.createElement("p", null, "Te llamamos en menos de 24 horas. Sin vendedores, sin presi\xF3n.")), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-secondary",
  onClick: onClick
}, "Pedir contacto"));

/* Footer */
const Footer = () => /*#__PURE__*/React.createElement("footer", {
  className: "sp-footer"
}, /*#__PURE__*/React.createElement("div", {
  className: "footer-inner"
}, /*#__PURE__*/React.createElement("div", {
  className: "col-brand"
}, /*#__PURE__*/React.createElement("img", {
  src: window.__resources.logoWhite,
  alt: "",
  style: {
    filter: 'brightness(0) invert(1)'
  }
}), /*#__PURE__*/React.createElement("p", null, "Odontomedica S.A. \u2014 Medicina prepaga en Paraguay desde 2002. Asunci\xF3n, Paraguay.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Planes"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Plan Previsor"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Plan Primordial"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Plan Integral"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Plan Superior"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Comparar planes")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Afiliados"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Ingresar al portal"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Credencial digital"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Autorizaciones"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Reembolsos"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Red de prestadores")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Contacto"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "WhatsApp 0981-123-456"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "0800-11-4000"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "marketing@saludprotegida.com.py"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Av. Mcal. L\xF3pez \u2014 Asunci\xF3n"))), /*#__PURE__*/React.createElement("div", {
  className: "footer-bottom"
}, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Odontomedica S.A. \xB7 Todos los derechos reservados."), /*#__PURE__*/React.createElement("span", null, "Superintendencia de Salud \xB7 Reg. XXXXX")));

/* Lucide icon wrapper */
const Icon = ({
  name,
  size = 20,
  color,
  strokeWidth = 1.75
}) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = '';
      const el = document.createElement('i');
      el.setAttribute('data-lucide', name);
      ref.current.appendChild(el);
      window.lucide.createIcons({
        attrs: {
          'stroke-width': strokeWidth,
          width: size,
          height: size
        }
      });
    }
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      display: 'inline-flex',
      color
    }
  });
};
Object.assign(window, {
  Nav,
  Hero,
  Features,
  PlanCard,
  PlansSection,
  CtaBanner,
  Footer,
  Icon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "export/src/ui_kits/web/Components.jsx", error: String((e && e.message) || e) }); }

// export/src/ui_kits/web/Portal.jsx
try { (() => {
/* Patient Portal */

const PortalSidebar = ({
  active,
  setActive
}) => /*#__PURE__*/React.createElement("aside", {
  className: "portal-sidebar"
}, /*#__PURE__*/React.createElement("div", {
  className: "brand"
}, /*#__PURE__*/React.createElement("img", {
  src: window.__resources.isologo04,
  alt: ""
})), /*#__PURE__*/React.createElement("div", {
  className: "section-label"
}, "Mi salud"), /*#__PURE__*/React.createElement("div", {
  className: `nav-item ${active === 'resumen' ? 'active' : ''}`,
  onClick: () => setActive('resumen')
}, /*#__PURE__*/React.createElement(Icon, {
  name: "layout-dashboard",
  size: 18
}), "Resumen"), /*#__PURE__*/React.createElement("div", {
  className: `nav-item ${active === 'credencial' ? 'active' : ''}`,
  onClick: () => setActive('credencial')
}, /*#__PURE__*/React.createElement(Icon, {
  name: "credit-card",
  size: 18
}), "Credencial digital"), /*#__PURE__*/React.createElement("div", {
  className: `nav-item ${active === 'autorizaciones' ? 'active' : ''}`,
  onClick: () => setActive('autorizaciones')
}, /*#__PURE__*/React.createElement(Icon, {
  name: "file-check-2",
  size: 18
}), "Autorizaciones"), /*#__PURE__*/React.createElement("div", {
  className: `nav-item ${active === 'turnos' ? 'active' : ''}`,
  onClick: () => setActive('turnos')
}, /*#__PURE__*/React.createElement(Icon, {
  name: "calendar-days",
  size: 18
}), "Turnos en Lister"), /*#__PURE__*/React.createElement("div", {
  className: `nav-item ${active === 'reembolsos' ? 'active' : ''}`,
  onClick: () => setActive('reembolsos')
}, /*#__PURE__*/React.createElement(Icon, {
  name: "receipt",
  size: 18
}), "Reembolsos"), /*#__PURE__*/React.createElement("div", {
  className: "section-label"
}, "Administraci\xF3n"), /*#__PURE__*/React.createElement("div", {
  className: "nav-item"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "users",
  size: 18
}), "Mi grupo familiar"), /*#__PURE__*/React.createElement("div", {
  className: "nav-item"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "wallet",
  size: 18
}), "Pagos y facturaci\xF3n"), /*#__PURE__*/React.createElement("div", {
  className: "nav-item"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "map-pin",
  size: 18
}), "Red de prestadores"), /*#__PURE__*/React.createElement("div", {
  className: "section-label"
}, "Cuenta"), /*#__PURE__*/React.createElement("div", {
  className: "nav-item"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "settings",
  size: 18
}), "Ajustes"), /*#__PURE__*/React.createElement("div", {
  className: "nav-item"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "life-buoy",
  size: 18
}), "Ayuda"));
const Credencial = () => /*#__PURE__*/React.createElement("div", {
  className: "credencial"
}, /*#__PURE__*/React.createElement("img", {
  src: window.__resources.logoCuadrado,
  alt: "",
  className: "iso"
}), /*#__PURE__*/React.createElement("div", {
  className: "label-sm"
}, "Credencial digital"), /*#__PURE__*/React.createElement("div", {
  className: "name"
}, "Ana Ben\xEDtez Rojas"), /*#__PURE__*/React.createElement("div", {
  className: "plan-pill"
}, "Plan Integral"), /*#__PURE__*/React.createElement("div", {
  className: "row"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "k"
}, "N\xBA afiliado"), /*#__PURE__*/React.createElement("div", {
  className: "v"
}, "SP-00941-02")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "k"
}, "C.I."), /*#__PURE__*/React.createElement("div", {
  className: "v"
}, "3.456.789")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "k"
}, "Vigencia"), /*#__PURE__*/React.createElement("div", {
  className: "v"
}, "12 / 2026"))));
const QuickActions = ({
  onAction
}) => /*#__PURE__*/React.createElement("div", {
  className: "quick-actions"
}, /*#__PURE__*/React.createElement("div", {
  className: "qa",
  onClick: () => onAction('autorizacion')
}, /*#__PURE__*/React.createElement("div", {
  className: "qa-icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "file-plus",
  size: 18
})), /*#__PURE__*/React.createElement("div", {
  className: "qa-label"
}, "Pedir autorizaci\xF3n")), /*#__PURE__*/React.createElement("div", {
  className: "qa",
  onClick: () => onAction('turno')
}, /*#__PURE__*/React.createElement("div", {
  className: "qa-icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "calendar-plus",
  size: 18
})), /*#__PURE__*/React.createElement("div", {
  className: "qa-label"
}, "Sacar turno en Lister")), /*#__PURE__*/React.createElement("div", {
  className: "qa"
}, /*#__PURE__*/React.createElement("div", {
  className: "qa-icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "pill",
  size: 18
})), /*#__PURE__*/React.createElement("div", {
  className: "qa-label"
}, "Farmacia con descuento")), /*#__PURE__*/React.createElement("div", {
  className: "qa"
}, /*#__PURE__*/React.createElement("div", {
  className: "qa-icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "message-circle",
  size: 18
})), /*#__PURE__*/React.createElement("div", {
  className: "qa-label"
}, "Abrir WhatsApp")));
const ActivityList = () => /*#__PURE__*/React.createElement("div", {
  className: "list"
}, /*#__PURE__*/React.createElement("div", {
  className: "list-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "dot"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "activity",
  size: 16
})), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "title"
}, "Laboratorio completo \u2014 Lister Mcal. L\xF3pez"), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "Dr. Acosta \xB7 14 abr 2026")), /*#__PURE__*/React.createElement("span", {
  className: "status-pill ok"
}, "Aprobado"), /*#__PURE__*/React.createElement("span", {
  className: "amount"
}, "Sin copago")), /*#__PURE__*/React.createElement("div", {
  className: "list-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "dot"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "scan-line",
  size: 16
})), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "title"
}, "Ecograf\xEDa abdominal"), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "Dra. Gim\xE9nez \xB7 10 abr 2026")), /*#__PURE__*/React.createElement("span", {
  className: "status-pill pending"
}, "Pendiente"), /*#__PURE__*/React.createElement("span", {
  className: "amount"
}, "\u2014")), /*#__PURE__*/React.createElement("div", {
  className: "list-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "dot"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "stethoscope",
  size: 16
})), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "title"
}, "Consulta cl\xEDnica \u2014 Lister Centro"), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "Dr. Villalba \xB7 2 abr 2026")), /*#__PURE__*/React.createElement("span", {
  className: "status-pill ok"
}, "Aprobado"), /*#__PURE__*/React.createElement("span", {
  className: "amount"
}, "\u20B2 25.000")), /*#__PURE__*/React.createElement("div", {
  className: "list-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "dot"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "receipt",
  size: 16
})), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "title"
}, "Reembolso \u2014 Kinesiolog\xEDa"), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "3 sesiones \xB7 28 mar 2026")), /*#__PURE__*/React.createElement("span", {
  className: "status-pill info"
}, "En proceso"), /*#__PURE__*/React.createElement("span", {
  className: "amount"
}, "\u20B2 180.000")));
const PortalHeader = ({
  showToast
}) => /*#__PURE__*/React.createElement("div", {
  className: "portal-header"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Hola, Ana \uD83D\uDC4B"), /*#__PURE__*/React.createElement("div", {
  className: "greeting"
}, "Tu pr\xF3xima consulta es ma\xF1ana a las 10:30 con Dr. Villalba.")), /*#__PURE__*/React.createElement("div", {
  className: "user-chip"
}, /*#__PURE__*/React.createElement("div", {
  className: "avatar"
}, "AB"), /*#__PURE__*/React.createElement("span", {
  className: "user-name"
}, "Ana B.")));
const Portal = ({
  showToast
}) => {
  const [active, setActive] = React.useState('resumen');
  return /*#__PURE__*/React.createElement("div", {
    className: "portal"
  }, /*#__PURE__*/React.createElement(PortalSidebar, {
    active: active,
    setActive: setActive
  }), /*#__PURE__*/React.createElement("main", {
    className: "portal-main"
  }, /*#__PURE__*/React.createElement(PortalHeader, null), /*#__PURE__*/React.createElement("div", {
    className: "portal-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Credencial, null), /*#__PURE__*/React.createElement("div", {
    className: "p-card"
  }, /*#__PURE__*/React.createElement("h3", null, "Actividad reciente"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "\xDAltimas autorizaciones y consultas"), /*#__PURE__*/React.createElement(ActivityList, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-card"
  }, /*#__PURE__*/React.createElement("h3", null, "\xBFQu\xE9 quer\xE9s hacer hoy?"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Acciones r\xE1pidas"), /*#__PURE__*/React.createElement(QuickActions, {
    onAction: showToast
  })), /*#__PURE__*/React.createElement("div", {
    className: "p-card",
    style: {
      background: 'var(--sp-50)',
      border: '0.5px solid var(--sp-200)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: 'var(--sp-900)'
    }
  }, "Tele-triaje Lister"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Disponible ahora \u2014 sin turno"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--gray-body)',
      lineHeight: 1.6,
      marginBottom: 16
    }
  }, "Si algo no puede esperar, una enfermera te escucha y te dice qu\xE9 hacer en menos de 10 minutos."), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      width: '100%',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "phone",
    size: 16,
    color: "#fff"
  }), "Llamar ahora"))))));
};
Object.assign(window, {
  PortalSidebar,
  Credencial,
  QuickActions,
  ActivityList,
  PortalHeader,
  Portal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "export/src/ui_kits/web/Portal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Blog.jsx
try { (() => {
/* Blog page */

const BlogHero = () => /*#__PURE__*/React.createElement("section", {
  style: {
    background: 'var(--navy-50)',
    padding: '72px 40px'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: 1200,
    margin: '0 auto'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--sp-700)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 12
  }
}, "Blog"), /*#__PURE__*/React.createElement("h1", {
  style: {
    fontSize: 44,
    fontWeight: 700,
    color: 'var(--navy-500)',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    marginBottom: 16
  }
}, "Contenido que te acompa\xF1a."), /*#__PURE__*/React.createElement("p", {
  style: {
    fontSize: 17,
    color: 'var(--gray-body)',
    maxWidth: 640,
    lineHeight: 1.6
  }
}, "Explicamos lo que quer\xE9s entender \u2014 sin jerga m\xE9dica, sin frases vac\xEDas.")));
const BlogCard = ({
  cat,
  title,
  excerpt,
  date,
  read,
  tint
}) => /*#__PURE__*/React.createElement("article", {
  className: "blog-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "thumb",
  style: {
    background: tint
  }
}, /*#__PURE__*/React.createElement("span", null, "[ foto humana \xB7 placeholder ]")), /*#__PURE__*/React.createElement("span", {
  className: "cat"
}, cat), /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("p", {
  className: "excerpt"
}, excerpt), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, date, " \xB7 ", read, " min de lectura"));
const BlogPage = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(BlogHero, null), /*#__PURE__*/React.createElement("section", {
  className: "section",
  style: {
    paddingTop: 56
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "blog-grid"
}, /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Familia \xB7 embarazo",
  title: "Primer trimestre: qu\xE9 estudios hacer y cu\xE1ndo",
  excerpt: "Te contamos paso a paso qu\xE9 esperar, qu\xE9 cubre tu plan y c\xF3mo pedir turno en Lister sin demoras.",
  date: "12 abr 2026",
  read: "6",
  tint: "#E6F7F6"
}), /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Autorizaciones",
  title: "Por qu\xE9 una autorizaci\xF3n puede demorar (y qu\xE9 hacemos nosotros)",
  excerpt: "Mand\xE1s la indicaci\xF3n por WhatsApp y nuestro equipo la revisa con tu prestador. Si algo no entra, te proponemos una alternativa antes de decirte que no.",
  date: "08 abr 2026",
  read: "4",
  tint: "#E6EDF4"
}), /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Bienestar",
  title: "Chequeo anual: los cinco estudios que cambian m\xE1s decisiones",
  excerpt: "No es sobre hacer todos los estudios. Es sobre los que realmente cambian lo que tu m\xE9dico te recomienda.",
  date: "02 abr 2026",
  read: "5",
  tint: "#FFF3E6"
}), /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Adultos mayores",
  title: "Mudanza de obra social a medicina prepaga: qu\xE9 mirar",
  excerpt: "Tres preguntas concretas para no llevarte sorpresas. La primera: \xBFqu\xE9 pasa con los medicamentos cr\xF3nicos?",
  date: "28 mar 2026",
  read: "7",
  tint: "#E6F7F6"
}), /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Lister",
  title: "Tele-triaje: cu\xE1ndo s\xED llamar y cu\xE1ndo ir directo a la guardia",
  excerpt: "Gu\xEDa pr\xE1ctica. Si ten\xE9s dolor en el pecho, NO llam\xE1s \u2014 vas directo. Te explicamos los otros escenarios.",
  date: "22 mar 2026",
  read: "3",
  tint: "#E6EDF4"
}), /*#__PURE__*/React.createElement(BlogCard, {
  cat: "Plan",
  title: "C\xF3mo leer tu plan sin marearte",
  excerpt: "'Lo que incluye' no es 'prestaciones cubiertas'. Te traducimos los t\xE9rminos que importan.",
  date: "15 mar 2026",
  read: "8",
  tint: "#FFF3E6"
}))));
Object.assign(window, {
  BlogHero,
  BlogCard,
  BlogPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Blog.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Components.jsx
try { (() => {
/* Nav component */
const Nav = ({
  route,
  setRoute
}) => /*#__PURE__*/React.createElement("nav", {
  className: "sp-nav"
}, /*#__PURE__*/React.createElement("a", {
  href: "#",
  className: "brand",
  onClick: e => {
    e.preventDefault();
    setRoute('home');
  }
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/logos/isologo-04.png",
  alt: "Salud Protegida"
})), /*#__PURE__*/React.createElement("div", {
  className: "sp-nav-links"
}, /*#__PURE__*/React.createElement("a", {
  href: "#",
  className: route === 'home' ? 'active' : '',
  onClick: e => {
    e.preventDefault();
    setRoute('home');
  }
}, "Inicio"), /*#__PURE__*/React.createElement("a", {
  href: "#",
  className: route === 'planes' ? 'active' : '',
  onClick: e => {
    e.preventDefault();
    setRoute('planes');
  }
}, "Planes"), /*#__PURE__*/React.createElement("a", {
  href: "#",
  onClick: e => e.preventDefault()
}, "Lister"), /*#__PURE__*/React.createElement("a", {
  href: "#",
  className: route === 'blog' ? 'active' : '',
  onClick: e => {
    e.preventDefault();
    setRoute('blog');
  }
}, "Blog"), /*#__PURE__*/React.createElement("a", {
  href: "#",
  onClick: e => e.preventDefault()
}, "Contacto")), /*#__PURE__*/React.createElement("div", {
  className: "sp-nav-cta"
}, /*#__PURE__*/React.createElement("button", {
  className: "btn btn-tertiary btn-sm",
  onClick: () => setRoute('portal')
}, "Mi cuenta"), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-primary btn-sm",
  onClick: () => setRoute('planes')
}, "Cotiz\xE1 tu plan")));

/* Hero — landing */
const Hero = ({
  onPrimary
}) => /*#__PURE__*/React.createElement("section", {
  className: "hero"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "overline"
}, "Medicina prepaga \xB7 desde 2002"), /*#__PURE__*/React.createElement("h1", null, "Cuidamos lo que m\xE1s quer\xE9s."), /*#__PURE__*/React.createElement("p", null, "M\xE1s de 9.100 familias paraguayas ya conf\xEDan en nosotros. Eleg\xED el plan que se adapta a tu familia y te acompa\xF1amos con la red de Lister, nuestro centro m\xE9dico propio."), /*#__PURE__*/React.createElement("div", {
  className: "hero-actions"
}, /*#__PURE__*/React.createElement("button", {
  className: "btn btn-accent",
  onClick: onPrimary
}, "Cotiz\xE1 tu plan"), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-outline-white"
}, "C\xF3mo funciona"))), /*#__PURE__*/React.createElement("div", {
  className: "hero-media"
}, /*#__PURE__*/React.createElement("div", {
  className: "placeholder"
}, "[ Foto humana paraguaya", /*#__PURE__*/React.createElement("br", null), "\u2014 familia en su casa, luz natural ]", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 11,
    opacity: 0.7
  }
}, "placeholder \xB7 pedir a fot\xF3grafo"))));

/* Feature strip — "por qué SP" */
const Features = () => /*#__PURE__*/React.createElement("section", {
  className: "features"
}, /*#__PURE__*/React.createElement("div", {
  className: "features-inner"
}, /*#__PURE__*/React.createElement("div", {
  className: "feature"
}, /*#__PURE__*/React.createElement("div", {
  className: "icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "stethoscope"
})), /*#__PURE__*/React.createElement("h3", null, "Lister, nuestro centro m\xE9dico propio"), /*#__PURE__*/React.createElement("p", null, "Consultas, laboratorio e imagen con copagos m\xE1s bajos. Tele-triaje sin turno para lo urgente.")), /*#__PURE__*/React.createElement("div", {
  className: "feature"
}, /*#__PURE__*/React.createElement("div", {
  className: "icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "message-circle"
})), /*#__PURE__*/React.createElement("h3", null, "Autorizaciones por WhatsApp en 24h"), /*#__PURE__*/React.createElement("p", null, "Mand\xE1s la indicaci\xF3n, revisamos con tu prestador, te avisamos por el mismo chat. Sin colas, sin formularios.")), /*#__PURE__*/React.createElement("div", {
  className: "feature"
}, /*#__PURE__*/React.createElement("div", {
  className: "icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "users"
})), /*#__PURE__*/React.createElement("h3", null, "Una empresa familiar, no un call center"), /*#__PURE__*/React.createElement("p", null, "23 a\xF1os atendiendo en Asunci\xF3n. Respondemos con nombre y apellido, no con n\xFAmero de ticket."))));

/* Plan card */
const PlanCard = ({
  logo,
  desc,
  price,
  features,
  featured,
  onClick
}) => /*#__PURE__*/React.createElement("div", {
  className: `plan-card ${featured ? 'featured' : ''}`,
  onClick: onClick
}, /*#__PURE__*/React.createElement("div", {
  className: "plan-logo"
}, /*#__PURE__*/React.createElement("img", {
  src: logo,
  alt: ""
})), /*#__PURE__*/React.createElement("p", {
  className: "desc"
}, desc), /*#__PURE__*/React.createElement("div", {
  className: "price"
}, /*#__PURE__*/React.createElement("span", {
  className: "amount"
}, "\u20B2 ", price), /*#__PURE__*/React.createElement("span", {
  className: "per"
}, "/ mes \xB7 titular")), /*#__PURE__*/React.createElement("ul", null, features.map((f, i) => /*#__PURE__*/React.createElement("li", {
  key: i
}, f))), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-outline",
  style: {
    marginTop: 8,
    width: '100%',
    justifyContent: 'center'
  }
}, "Ver detalle"));

/* Plans section */
const PlansSection = ({
  onSelect
}) => /*#__PURE__*/React.createElement("section", {
  className: "section"
}, /*#__PURE__*/React.createElement("div", {
  className: "section-header"
}, /*#__PURE__*/React.createElement("div", {
  className: "overline"
}, "Planes"), /*#__PURE__*/React.createElement("h2", null, "Eleg\xED el plan que encaja con tu familia"), /*#__PURE__*/React.createElement("p", null, "Cuatro planes principales. Cambi\xE1s cuando tu realidad cambia \u2014 no hay letra chica ni permanencia m\xEDnima.")), /*#__PURE__*/React.createElement("div", {
  className: "plans-grid"
}, /*#__PURE__*/React.createElement(PlanCard, {
  logo: "../../assets/logos/plan-03.png",
  desc: "Lo esencial, sin copagos sorpresa. Ideal para empezar.",
  price: "320.000",
  features: ['Consultas Lister', 'Laboratorio básico', 'WhatsApp 24h', 'Tele-triaje'],
  onClick: () => onSelect('Previsor')
}), /*#__PURE__*/React.createElement(PlanCard, {
  logo: "../../assets/logos/plan-04.png",
  desc: "Cobertura amplia con medicamentos con descuento.",
  price: "480.000",
  features: ['Todo de Previsor', 'Medicamentos 40% off', 'Imagen simple', 'Hospitalización regional'],
  onClick: () => onSelect('Primordial')
}), /*#__PURE__*/React.createElement(PlanCard, {
  logo: "../../assets/logos/plan-02.png",
  desc: "Cobertura completa para vos y tu familia, con 50+ prestadores.",
  price: "720.000",
  featured: true,
  features: ['Todo de Primordial', 'Red completa 50+', 'Alta complejidad', 'Maternidad', 'Cobertura nacional'],
  onClick: () => onSelect('Integral')
}), /*#__PURE__*/React.createElement(PlanCard, {
  logo: "../../assets/logos/plan-05.png",
  desc: "Tope alto y cobertura internacional regional.",
  price: "1.180.000",
  features: ['Todo de Integral', 'Habitación privada', 'Cobertura MERCOSUR', 'Consulta domiciliaria'],
  onClick: () => onSelect('Superior')
})));

/* CTA banner */
const CtaBanner = ({
  onClick
}) => /*#__PURE__*/React.createElement("div", {
  className: "cta-banner"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "\xBFNo sab\xE9s qu\xE9 plan te conviene?"), /*#__PURE__*/React.createElement("p", null, "Te llamamos en menos de 24 horas. Sin vendedores, sin presi\xF3n.")), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-secondary",
  onClick: onClick
}, "Pedir contacto"));

/* Footer */
const Footer = () => /*#__PURE__*/React.createElement("footer", {
  className: "sp-footer"
}, /*#__PURE__*/React.createElement("div", {
  className: "footer-inner"
}, /*#__PURE__*/React.createElement("div", {
  className: "col-brand"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/logos/logo-sp-2025-white.png",
  alt: "",
  style: {
    filter: 'brightness(0) invert(1)'
  }
}), /*#__PURE__*/React.createElement("p", null, "Odontomedica S.A. \u2014 Medicina prepaga en Paraguay desde 2002. Asunci\xF3n, Paraguay.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Planes"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Plan Previsor"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Plan Primordial"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Plan Integral"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Plan Superior"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Comparar planes")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Afiliados"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Ingresar al portal"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Credencial digital"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Autorizaciones"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Reembolsos"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Red de prestadores")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Contacto"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "WhatsApp 0981-123-456"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "0800-11-4000"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "marketing@saludprotegida.com.py"), /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Av. Mcal. L\xF3pez \u2014 Asunci\xF3n"))), /*#__PURE__*/React.createElement("div", {
  className: "footer-bottom"
}, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Odontomedica S.A. \xB7 Todos los derechos reservados."), /*#__PURE__*/React.createElement("span", null, "Superintendencia de Salud \xB7 Reg. XXXXX")));

/* Lucide icon wrapper */
const Icon = ({
  name,
  size = 20,
  color,
  strokeWidth = 1.75
}) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = '';
      const el = document.createElement('i');
      el.setAttribute('data-lucide', name);
      ref.current.appendChild(el);
      window.lucide.createIcons({
        attrs: {
          'stroke-width': strokeWidth,
          width: size,
          height: size
        }
      });
    }
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      display: 'inline-flex',
      color
    }
  });
};
Object.assign(window, {
  Nav,
  Hero,
  Features,
  PlanCard,
  PlansSection,
  CtaBanner,
  Footer,
  Icon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Portal.jsx
try { (() => {
/* Patient Portal */

const PortalSidebar = ({
  active,
  setActive
}) => /*#__PURE__*/React.createElement("aside", {
  className: "portal-sidebar"
}, /*#__PURE__*/React.createElement("div", {
  className: "brand"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/logos/isologo-04.png",
  alt: ""
})), /*#__PURE__*/React.createElement("div", {
  className: "section-label"
}, "Mi salud"), /*#__PURE__*/React.createElement("div", {
  className: `nav-item ${active === 'resumen' ? 'active' : ''}`,
  onClick: () => setActive('resumen')
}, /*#__PURE__*/React.createElement(Icon, {
  name: "layout-dashboard",
  size: 18
}), "Resumen"), /*#__PURE__*/React.createElement("div", {
  className: `nav-item ${active === 'credencial' ? 'active' : ''}`,
  onClick: () => setActive('credencial')
}, /*#__PURE__*/React.createElement(Icon, {
  name: "credit-card",
  size: 18
}), "Credencial digital"), /*#__PURE__*/React.createElement("div", {
  className: `nav-item ${active === 'autorizaciones' ? 'active' : ''}`,
  onClick: () => setActive('autorizaciones')
}, /*#__PURE__*/React.createElement(Icon, {
  name: "file-check-2",
  size: 18
}), "Autorizaciones"), /*#__PURE__*/React.createElement("div", {
  className: `nav-item ${active === 'turnos' ? 'active' : ''}`,
  onClick: () => setActive('turnos')
}, /*#__PURE__*/React.createElement(Icon, {
  name: "calendar-days",
  size: 18
}), "Turnos en Lister"), /*#__PURE__*/React.createElement("div", {
  className: `nav-item ${active === 'reembolsos' ? 'active' : ''}`,
  onClick: () => setActive('reembolsos')
}, /*#__PURE__*/React.createElement(Icon, {
  name: "receipt",
  size: 18
}), "Reembolsos"), /*#__PURE__*/React.createElement("div", {
  className: "section-label"
}, "Administraci\xF3n"), /*#__PURE__*/React.createElement("div", {
  className: "nav-item"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "users",
  size: 18
}), "Mi grupo familiar"), /*#__PURE__*/React.createElement("div", {
  className: "nav-item"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "wallet",
  size: 18
}), "Pagos y facturaci\xF3n"), /*#__PURE__*/React.createElement("div", {
  className: "nav-item"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "map-pin",
  size: 18
}), "Red de prestadores"), /*#__PURE__*/React.createElement("div", {
  className: "section-label"
}, "Cuenta"), /*#__PURE__*/React.createElement("div", {
  className: "nav-item"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "settings",
  size: 18
}), "Ajustes"), /*#__PURE__*/React.createElement("div", {
  className: "nav-item"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "life-buoy",
  size: 18
}), "Ayuda"));
const Credencial = () => /*#__PURE__*/React.createElement("div", {
  className: "credencial"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/logos/logo-sp-cuadrado.png",
  alt: "",
  className: "iso"
}), /*#__PURE__*/React.createElement("div", {
  className: "label-sm"
}, "Credencial digital"), /*#__PURE__*/React.createElement("div", {
  className: "name"
}, "Ana Ben\xEDtez Rojas"), /*#__PURE__*/React.createElement("div", {
  className: "plan-pill"
}, "Plan Integral"), /*#__PURE__*/React.createElement("div", {
  className: "row"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "k"
}, "N\xBA afiliado"), /*#__PURE__*/React.createElement("div", {
  className: "v"
}, "SP-00941-02")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "k"
}, "C.I."), /*#__PURE__*/React.createElement("div", {
  className: "v"
}, "3.456.789")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "k"
}, "Vigencia"), /*#__PURE__*/React.createElement("div", {
  className: "v"
}, "12 / 2026"))));
const QuickActions = ({
  onAction
}) => /*#__PURE__*/React.createElement("div", {
  className: "quick-actions"
}, /*#__PURE__*/React.createElement("div", {
  className: "qa",
  onClick: () => onAction('autorizacion')
}, /*#__PURE__*/React.createElement("div", {
  className: "qa-icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "file-plus",
  size: 18
})), /*#__PURE__*/React.createElement("div", {
  className: "qa-label"
}, "Pedir autorizaci\xF3n")), /*#__PURE__*/React.createElement("div", {
  className: "qa",
  onClick: () => onAction('turno')
}, /*#__PURE__*/React.createElement("div", {
  className: "qa-icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "calendar-plus",
  size: 18
})), /*#__PURE__*/React.createElement("div", {
  className: "qa-label"
}, "Sacar turno en Lister")), /*#__PURE__*/React.createElement("div", {
  className: "qa"
}, /*#__PURE__*/React.createElement("div", {
  className: "qa-icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "pill",
  size: 18
})), /*#__PURE__*/React.createElement("div", {
  className: "qa-label"
}, "Farmacia con descuento")), /*#__PURE__*/React.createElement("div", {
  className: "qa"
}, /*#__PURE__*/React.createElement("div", {
  className: "qa-icon"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "message-circle",
  size: 18
})), /*#__PURE__*/React.createElement("div", {
  className: "qa-label"
}, "Abrir WhatsApp")));
const ActivityList = () => /*#__PURE__*/React.createElement("div", {
  className: "list"
}, /*#__PURE__*/React.createElement("div", {
  className: "list-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "dot"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "activity",
  size: 16
})), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "title"
}, "Laboratorio completo \u2014 Lister Mcal. L\xF3pez"), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "Dr. Acosta \xB7 14 abr 2026")), /*#__PURE__*/React.createElement("span", {
  className: "status-pill ok"
}, "Aprobado"), /*#__PURE__*/React.createElement("span", {
  className: "amount"
}, "Sin copago")), /*#__PURE__*/React.createElement("div", {
  className: "list-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "dot"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "scan-line",
  size: 16
})), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "title"
}, "Ecograf\xEDa abdominal"), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "Dra. Gim\xE9nez \xB7 10 abr 2026")), /*#__PURE__*/React.createElement("span", {
  className: "status-pill pending"
}, "Pendiente"), /*#__PURE__*/React.createElement("span", {
  className: "amount"
}, "\u2014")), /*#__PURE__*/React.createElement("div", {
  className: "list-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "dot"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "stethoscope",
  size: 16
})), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "title"
}, "Consulta cl\xEDnica \u2014 Lister Centro"), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "Dr. Villalba \xB7 2 abr 2026")), /*#__PURE__*/React.createElement("span", {
  className: "status-pill ok"
}, "Aprobado"), /*#__PURE__*/React.createElement("span", {
  className: "amount"
}, "\u20B2 25.000")), /*#__PURE__*/React.createElement("div", {
  className: "list-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "dot"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "receipt",
  size: 16
})), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "title"
}, "Reembolso \u2014 Kinesiolog\xEDa"), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, "3 sesiones \xB7 28 mar 2026")), /*#__PURE__*/React.createElement("span", {
  className: "status-pill info"
}, "En proceso"), /*#__PURE__*/React.createElement("span", {
  className: "amount"
}, "\u20B2 180.000")));
const PortalHeader = ({
  showToast
}) => /*#__PURE__*/React.createElement("div", {
  className: "portal-header"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Hola, Ana \uD83D\uDC4B"), /*#__PURE__*/React.createElement("div", {
  className: "greeting"
}, "Tu pr\xF3xima consulta es ma\xF1ana a las 10:30 con Dr. Villalba.")), /*#__PURE__*/React.createElement("div", {
  className: "user-chip"
}, /*#__PURE__*/React.createElement("div", {
  className: "avatar"
}, "AB"), /*#__PURE__*/React.createElement("span", {
  className: "user-name"
}, "Ana B.")));
const Portal = ({
  showToast
}) => {
  const [active, setActive] = React.useState('resumen');
  return /*#__PURE__*/React.createElement("div", {
    className: "portal"
  }, /*#__PURE__*/React.createElement(PortalSidebar, {
    active: active,
    setActive: setActive
  }), /*#__PURE__*/React.createElement("main", {
    className: "portal-main"
  }, /*#__PURE__*/React.createElement(PortalHeader, null), /*#__PURE__*/React.createElement("div", {
    className: "portal-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Credencial, null), /*#__PURE__*/React.createElement("div", {
    className: "p-card"
  }, /*#__PURE__*/React.createElement("h3", null, "Actividad reciente"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "\xDAltimas autorizaciones y consultas"), /*#__PURE__*/React.createElement(ActivityList, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-card"
  }, /*#__PURE__*/React.createElement("h3", null, "\xBFQu\xE9 quer\xE9s hacer hoy?"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Acciones r\xE1pidas"), /*#__PURE__*/React.createElement(QuickActions, {
    onAction: showToast
  })), /*#__PURE__*/React.createElement("div", {
    className: "p-card",
    style: {
      background: 'var(--sp-50)',
      border: '0.5px solid var(--sp-200)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: 'var(--sp-900)'
    }
  }, "Tele-triaje Lister"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Disponible ahora \u2014 sin turno"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--gray-body)',
      lineHeight: 1.6,
      marginBottom: 16
    }
  }, "Si algo no puede esperar, una enfermera te escucha y te dice qu\xE9 hacer en menos de 10 minutos."), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      width: '100%',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "phone",
    size: 16,
    color: "#fff"
  }), "Llamar ahora"))))));
};
Object.assign(window, {
  PortalSidebar,
  Credencial,
  QuickActions,
  ActivityList,
  PortalHeader,
  Portal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Portal.jsx", error: String((e && e.message) || e) }); }

})();
