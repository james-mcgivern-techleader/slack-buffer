(function () {
  const e = React.createElement;
  const useEffect = React.useEffect;
  const useMemo = React.useMemo;
  const useState = React.useState;

  function usePathname() {
    const [pathname, setPathname] = useState(window.location.pathname);

    useEffect(() => {
      function onPopState() {
        setPathname(window.location.pathname);
      }

      window.addEventListener("popstate", onPopState);
      return () => window.removeEventListener("popstate", onPopState);
    }, []);

    return pathname;
  }

  function navigate(to) {
    if (window.location.pathname === to) return;
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function Link(props) {
    return e(
      "a",
      {
        href: props.to,
        className: props.className,
        onClick: (evt) => {
          // SPA navigation for same-origin clicks
          evt.preventDefault();
          navigate(props.to);
        },
      },
      props.children
    );
  }

  function Home() {
    return e(
      React.Fragment,
      null,
      e("h1", null, "slack-buffer"),
      e(
        "p",
        { className: "muted" },
        "Web UI skeleton is running. Slack events endpoint is /slack/events."
      )
    );
  }

  function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState(null);

    async function onSubmit(evt) {
      evt.preventDefault();
      setStatus("Logging in...");

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (res.ok && (data.ok === true || data.ok === "true")) {
          navigate("/");
          return;
        }

        setStatus(data.message || "Login failed.");
      } catch (err) {
        setStatus("Login failed.");
      }
    }

    return e(
      "div",
      null,
      e("h1", null, "Login"),
      e(
        "form",
        { className: "form", onSubmit },
        e(
          "label",
          null,
          e("div", { className: "label" }, "Email"),
          e("input", {
            type: "email",
            value: email,
            onChange: (evt) => setEmail(evt.target.value),
            required: true,
          })
        ),
        e(
          "label",
          null,
          e("div", { className: "label" }, "Password"),
          e("input", {
            type: "password",
            value: password,
            onChange: (evt) => setPassword(evt.target.value),
            required: true,
          })
        ),
        e(
          "div",
          { className: "row" },
          e("button", { type: "submit" }, "Login"),
          e(Link, { to: "/signup", className: "link" }, "Need an account? Sign up")
        )
      ),
      status ? e("p", { className: "muted" }, status) : null
    );
  }

  function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState(null);

    async function onSubmit(evt) {
      evt.preventDefault();
      setStatus("Signing up...");

      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        setStatus(data.message || "Signed up.");
      } catch (err) {
        setStatus("Signup failed.");
      }
    }

    return e(
      "div",
      null,
      e("h1", null, "Sign up"),
      e(
        "form",
        { className: "form", onSubmit },
        e(
          "label",
          null,
          e("div", { className: "label" }, "Email"),
          e("input", {
            type: "email",
            value: email,
            onChange: (evt) => setEmail(evt.target.value),
            required: true,
          })
        ),
        e(
          "label",
          null,
          e("div", { className: "label" }, "Password"),
          e("input", {
            type: "password",
            value: password,
            onChange: (evt) => setPassword(evt.target.value),
            required: true,
          })
        ),
        e(
          "div",
          { className: "row" },
          e("button", { type: "submit" }, "Create account"),
          e(Link, { to: "/login", className: "link" }, "Already have an account? Log in")
        )
      ),
      status ? e("p", { className: "muted" }, status) : null
    );
  }

  function NotFound(props) {
    return e(
      "div",
      null,
      e("h1", null, "Not found"),
      e("p", { className: "muted" }, "No route for ", props.pathname)
    );
  }

  function App() {
    const pathname = usePathname();

    const view = useMemo(() => {
      // Normalize in case user hits /app/* routes
      const p = pathname.startsWith("/app/") ? pathname.slice(4) : pathname;

      if (p === "/" || p === "") return e(Home);
      if (p === "/login") return e(Login);
      if (p === "/signup") return e(Signup);
      return e(NotFound, { pathname: pathname });
    }, [pathname]);

    return e(
      "div",
      { className: "container" },
      e(
        "nav",
        { className: "nav" },
        e(Link, { to: "/", className: "brand" }, "slack-buffer"),
        e(
          "div",
          { className: "navLinks" },
          e(Link, { to: "/login", className: "link" }, "Login"),
          e(Link, { to: "/signup", className: "link" }, "Sign up")
        )
      ),
      e("div", { className: "card" }, view)
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(e(App));
})();
