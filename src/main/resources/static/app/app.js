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

  function Home(props) {
    return e(
      React.Fragment,
      null,
      e("h1", null, "slack-buffer"),
      props.user
        ? e(
            "p",
            { className: "muted" },
            "Signed in as ",
            props.user.email,
            "."
          )
        : e(
            "p",
            { className: "muted" },
            "Not signed in. Use Login or Sign up to continue."
          ),
      e(
        "p",
        { className: "muted" },
        "Slack events endpoint is /slack/events."
      )
    );
  }

  function Login(props) {
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

        if (res.ok && data && data.ok === true && data.token) {
          props.onAuth({ token: data.token, email: data.email });
          navigate("/");
          return;
        }

        setStatus((data && data.message) || "Login failed.");
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

  function Signup(props) {
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

        if (res.ok && data && data.ok === true && data.token) {
          props.onAuth({ token: data.token, email: data.email });
          navigate("/");
          return;
        }

        setStatus((data && data.message) || "Signup failed.");
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

  function CreateView(props) {
    const [text, setText] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [channelId, setChannelId] = useState("");
    const [channels, setChannels] = useState([]);
    const [channelsStatus, setChannelsStatus] = useState("Loading channels...");
    const [status, setStatus] = useState(null);

    useEffect(() => {
      (async () => {
        try {
          const headers = {};
          if (props && props.authToken) {
            headers.Authorization = "Bearer " + props.authToken;
          }

          const res = await fetch("/v1/api/user/channels", { headers });
          if (!res.ok) throw new Error("failed");

          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setChannels(list);
          setChannelsStatus(null);

          if (!channelId && list.length > 0) {
            setChannelId(list[0].id);
          }
        } catch (err) {
          setChannels([]);
          setChannelsStatus("Failed to load channels.");
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function onSubmit(evt) {
      evt.preventDefault();
      setStatus("Scheduling...");

      // TODO: wire up to real backend endpoint
      // For now, simulate a successful schedule.
      await Promise.resolve();
      setStatus(
        "Scheduled (stub) for channel " +
          (channelId || "(none)") +
          ". Check Scheduled tab once backend is implemented."
      );
    }

    const channelSelectDisabled = channels.length === 0;

    return e(
      "div",
      null,
      e("h1", null, "Create"),
      e(
        "form",
        { className: "form", onSubmit },
        e(
          "label",
          null,
          e("div", { className: "label" }, "Channel"),
          e(
            "select",
            {
              value: channelId,
              onChange: (evt) => setChannelId(evt.target.value),
              disabled: channelSelectDisabled,
              required: true,
            },
            channels.map((c) => e("option", { key: c.id, value: c.id }, c.name))
          ),
          channelsStatus ? e("div", { className: "hint" }, channelsStatus) : null
        ),
        e(
          "label",
          null,
          e("div", { className: "label" }, "Message"),
          e("textarea", {
            rows: 5,
            value: text,
            onChange: (evt) => setText(evt.target.value),
            placeholder: "Write something to post...",
            required: true,
          })
        ),
        e(
          "label",
          null,
          e("div", { className: "label" }, "Schedule for"),
          e("input", {
            type: "datetime-local",
            value: scheduledAt,
            onChange: (evt) => setScheduledAt(evt.target.value),
            required: true,
          })
        ),
        e("button", { type: "submit" }, "Schedule")
      ),
      status ? e("p", { className: "muted" }, status) : null
    );
  }

  function ScheduledView(props) {
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState("Loading scheduled posts...");

    useEffect(() => {
      (async () => {
        try {
          const headers = {};
          if (props && props.authToken) {
            headers.Authorization = "Bearer " + props.authToken;
          }

          const res = await fetch("/v1/api/scheduled-posts", { headers });
          if (!res.ok) throw new Error("failed");

          const data = await res.json();
          const list = Array.isArray(data) ? data : [];

          list.sort((a, b) => {
            const at = new Date(a.scheduledAt).getTime();
            const bt = new Date(b.scheduledAt).getTime();
            return at - bt;
          });

          setPosts(list);
          setStatus(null);
        } catch (err) {
          setPosts([]);
          setStatus("Failed to load scheduled posts.");
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function formatDateTime(iso) {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString();
    }

    return e(
      "div",
      null,
      e("h1", null, "Scheduled"),
      status ? e("p", { className: "muted" }, status) : null,
      !status && posts.length === 0
        ? e("p", { className: "muted" }, "No scheduled posts.")
        : null,
      e(
        "div",
        { className: "postList" },
        posts.map((p) =>
          e(
            "div",
            { key: p.id, className: "postCard" },
            e(
              "div",
              { className: "postMeta" },
              e("span", { className: "postChannel" }, p.channelName || p.channelId),
              e("span", { className: "postTime" }, formatDateTime(p.scheduledAt))
            ),
            e("div", { className: "postText" }, p.text)
          )
        )
      )
    );
  }

  function PublishedView(props) {
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState("Loading published posts...");

    useEffect(() => {
      (async () => {
        try {
          const headers = {};
          if (props && props.authToken) {
            headers.Authorization = "Bearer " + props.authToken;
          }

          const res = await fetch("/v1/api/published-posts", { headers });
          if (!res.ok) throw new Error("failed");

          const data = await res.json();
          const list = Array.isArray(data) ? data : [];

          // Most recent (closest to now) first; oldest last.
          list.sort((a, b) => {
            const at = new Date(a.scheduledAt).getTime();
            const bt = new Date(b.scheduledAt).getTime();
            return bt - at;
          });

          setPosts(list);
          setStatus(null);
        } catch (err) {
          setPosts([]);
          setStatus("Failed to load published posts.");
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function formatDateTime(iso) {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString();
    }

    return e(
      "div",
      null,
      e("h1", null, "Published"),
      status ? e("p", { className: "muted" }, status) : null,
      !status && posts.length === 0
        ? e("p", { className: "muted" }, "No published posts.")
        : null,
      e(
        "div",
        { className: "postList" },
        posts.map((p) =>
          e(
            "div",
            { key: p.id, className: "postCard" },
            e(
              "div",
              { className: "postMeta" },
              e("span", { className: "postChannel" }, p.channelName || p.channelId),
              e("span", { className: "postTime" }, formatDateTime(p.scheduledAt))
            ),
            e("div", { className: "postText" }, p.text)
          )
        )
      )
    );
  }

  function Profile(props) {
    if (!props.user) {
      return e(
        "div",
        null,
        e("h1", null, "Profile"),
        e("p", { className: "muted" }, "You are not signed in."),
        e(Link, { to: "/login", className: "link" }, "Go to login")
      );
    }

    return e(
      "div",
      null,
      e("h1", null, "Profile"),
      e("p", { className: "muted" }, "Email: ", props.user.email)
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

    const [auth, setAuth] = useState(() => {
      try {
        const raw = window.localStorage.getItem("slackBufferAuth");
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    });

    const user = auth && auth.email ? { email: auth.email } : null;

    function onAuth(nextAuth) {
      setAuth(nextAuth);
      try {
        window.localStorage.setItem("slackBufferAuth", JSON.stringify(nextAuth));
      } catch (e) {
        // ignore
      }
    }

    useEffect(() => {
      // If we have a token, verify it and hydrate user info.
      if (!auth || !auth.token) return;

      (async () => {
        try {
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: "Bearer " + auth.token },
          });
          if (!res.ok) throw new Error("unauthorized");
          const data = await res.json();
          if (data && data.ok === true && data.email) {
            onAuth({ token: auth.token, email: data.email });
          } else {
            throw new Error("unauthorized");
          }
        } catch (e) {
          setAuth(null);
          try {
            window.localStorage.removeItem("slackBufferAuth");
          } catch (e) {
            // ignore
          }
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const view = useMemo(() => {
      // Normalize in case user hits /app/* routes
      const p = pathname.startsWith("/app/") ? pathname.slice(4) : pathname;

      if (p === "/" || p === "") return e(Home, { user });
      if (p === "/create") return e(CreateView, { authToken: auth && auth.token });
      if (p === "/scheduled") return e(ScheduledView, { authToken: auth && auth.token });
      if (p === "/published") return e(PublishedView, { authToken: auth && auth.token });
      if (p === "/login") return e(Login, { onAuth });
      if (p === "/signup") return e(Signup, { onAuth });
      if (p === "/profile") return e(Profile, { user });
      return e(NotFound, { pathname: pathname });
    }, [pathname, user]);

    return e(
      "div",
      { className: "container" },
      e(
        "header",
        { className: "header" },
        e(
          "div",
          { className: "topBar" },
          e(Link, { to: "/", className: "brand" }, "slack-buffer"),
          e(
            "div",
            { className: "navLinks" },
            user
              ? e(Link, { to: "/profile", className: "link" }, "Profile")
              : e(
                  React.Fragment,
                  null,
                  e(Link, { to: "/login", className: "link" }, "Login"),
                  e(Link, { to: "/signup", className: "link" }, "Sign up")
                )
          )
        ),
        user
          ? e(
              "nav",
              { className: "menu" },
              e(
                "ul",
                { className: "menuList" },
                e("li", null, e(Link, { to: "/", className: "menuLink" }, "Home")),
                e(
                  "li",
                  null,
                  e(Link, { to: "/create", className: "menuLink" }, "Create")
                ),
                e(
                  "li",
                  null,
                  e(Link, { to: "/scheduled", className: "menuLink" }, "Scheduled")
                ),
                e(
                  "li",
                  null,
                  e(Link, { to: "/published", className: "menuLink" }, "Published")
                )
              )
            )
          : null
      ),
      e("div", { className: "card" }, view)
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(e(App));
})();
