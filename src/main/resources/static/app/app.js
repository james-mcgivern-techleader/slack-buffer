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

  function isoToDatetimeLocalValue(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";

    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  function useChannels(authToken) {
    const [channels, setChannels] = useState([]);
    const [channelsStatus, setChannelsStatus] = useState("Loading channels...");

    useEffect(() => {
      (async () => {
        try {
          const headers = {};
          if (authToken) {
            headers.Authorization = "Bearer " + authToken;
          }

          const res = await fetch("/v1/api/user/channels", { headers });
          if (!res.ok) throw new Error("failed");

          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setChannels(list);
          setChannelsStatus(null);
        } catch (err) {
          setChannels([]);
          setChannelsStatus("Failed to load channels.");
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { channels, channelsStatus };
  }

  function PostEditorForm(props) {
    const [channelId, setChannelId] = useState(props.initialChannelId || "");
    const [text, setText] = useState(props.initialText || "");
    const [scheduledAt, setScheduledAt] = useState(props.initialScheduledAt || "");
    const [status, setStatus] = useState(null);

    const { channels, channelsStatus } = useChannels(props.authToken);

    useEffect(() => {
      if (channelId) return;
      if (!channels || channels.length === 0) return;
      setChannelId(channels[0].id);
    }, [channels, channelId]);

    async function onSubmit(evt) {
      evt.preventDefault();
      setStatus("Scheduling...");

      const selectedChannel = channels.find((c) => c.id === channelId) || null;

      if (props.onSubmit) {
        try {
          await props.onSubmit({
            channelId,
            channelName: selectedChannel ? selectedChannel.name : null,
            text,
            scheduledAt,
          });
          setStatus(null);
        } catch (e) {
          setStatus("Save failed.");
        }
        return;
      }

      // Default stub behavior
      await Promise.resolve();
      setStatus(
        "Scheduled (stub) for channel " +
          (channelId || "(none)") +
          ". Backend schedule/save is not implemented yet."
      );
    }

    const channelSelectDisabled = channels.length === 0;

    return e(
      React.Fragment,
      null,
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
        e(
          "div",
          { className: "row" },
          e("button", { type: "submit" }, props.submitLabel || "Schedule"),
          props.onCancel
            ? e(
                "a",
                {
                  href: "/cancel",
                  className: "link",
                  onClick: (evt) => {
                    evt.preventDefault();
                    props.onCancel();
                  },
                },
                "Cancel"
              )
            : null
        )
      ),
      status ? e("p", { className: "muted" }, status) : null
    );
  }

  function Modal(props) {
    useEffect(() => {
      function onKeyDown(evt) {
        if (evt.key === "Escape") {
          props.onClose();
        }
      }

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [props]);

    return e(
      "div",
      {
        className: "modalOverlay",
        onMouseDown: (evt) => {
          if (evt.target === evt.currentTarget) props.onClose();
        },
      },
      e(
        "div",
        { className: "modal" },
        e(
          "div",
          { className: "modalHeader" },
          e("div", { className: "modalTitle" }, props.title || ""),
          e(
            "button",
            { className: "modalClose", onClick: props.onClose, type: "button" },
            "×"
          )
        ),
        e("div", { className: "modalBody" }, props.children)
      )
    );
  }

  function CreateView(props) {
    async function onCreateSubmit(payload) {
      const headers = { "Content-Type": "application/json" };
      if (props && props.authToken) {
        headers.Authorization = "Bearer " + props.authToken;
      }

      const scheduledIso = new Date(payload.scheduledAt).toISOString();

      const body = {
        postId: null,
        channelId: payload.channelId,
        channelName: payload.channelName,
        text: payload.text,
        scheduledAt: scheduledIso,
      };

      const res = await fetch("/v1/api/post", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("save failed");
      }

      await res.json();
      navigate("/scheduled");
    }

    return e(
      "div",
      null,
      e("h1", null, "Create"),
      e(PostEditorForm, {
        authToken: props && props.authToken,
        submitLabel: "Schedule",
        onSubmit: onCreateSubmit,
      })
    );
  }

  function ScheduledView(props) {
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState("Loading scheduled posts...");
    const [editingPost, setEditingPost] = useState(null);

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

    async function onDelete(postId) {
      const ok = window.confirm("Delete this scheduled post?");
      if (!ok) return;

      const headers = {};
      if (props && props.authToken) {
        headers.Authorization = "Bearer " + props.authToken;
      }

      setStatus("Deleting...");

      try {
        const res = await fetch("/v1/api/post/" + encodeURIComponent(postId), {
          method: "DELETE",
          headers,
        });

        if (!res.ok) {
          throw new Error("delete failed");
        }

        setPosts((prev) => prev.filter((p) => p.postId !== postId));
        setEditingPost((prev) => (prev && prev.postId === postId ? null : prev));
        setStatus(null);
      } catch (err) {
        setStatus("Delete failed.");
      }
    }

    async function onEditSubmit(payload) {
      const headers = { "Content-Type": "application/json" };
      if (props && props.authToken) {
        headers.Authorization = "Bearer " + props.authToken;
      }

      const scheduledIso = new Date(payload.scheduledAt).toISOString();

      const body = {
        postId: editingPost.postId,
        channelId: payload.channelId,
        channelName: payload.channelName || editingPost.channelName,
        text: payload.text,
        scheduledAt: scheduledIso,
      };

      const res = await fetch("/v1/api/post/" + encodeURIComponent(editingPost.postId), {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("save failed");
      }

      const updated = await res.json();

      const next = posts.map((p) => (p.postId === editingPost.postId ? updated : p));

      next.sort((a, b) => {
        const at = new Date(a.scheduledAt).getTime();
        const bt = new Date(b.scheduledAt).getTime();
        return at - bt;
      });

      setPosts(next);
      setEditingPost(null);
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
            { key: p.postId, className: "postCard" },
            e(
              "div",
              { className: "postMeta" },
              e("span", { className: "postChannel" }, p.channelName || p.channelId),
              e(
                "div",
                { className: "postMetaRight" },
                e("span", { className: "postTime" }, formatDateTime(p.scheduledAt)),
                e(
                  "a",
                  {
                    href: "/edit",
                    className: "link",
                    onClick: (evt) => {
                      evt.preventDefault();
                      setEditingPost(p);
                    },
                  },
                  "Edit"
                ),
                e(
                  "a",
                  {
                    href: "/delete",
                    className: "link linkDanger",
                    onClick: (evt) => {
                      evt.preventDefault();
                      onDelete(p.postId);
                    },
                  },
                  "Delete"
                )
              )
            ),
            e("div", { className: "postText" }, p.text)
          )
        )
      ),
      editingPost
        ? e(
            Modal,
            {
              title: "Edit scheduled post",
              onClose: () => setEditingPost(null),
            },
            e(PostEditorForm, {
              authToken: props && props.authToken,
              initialChannelId: editingPost.channelId,
              initialText: editingPost.text,
              initialScheduledAt: isoToDatetimeLocalValue(editingPost.scheduledAt),
              submitLabel: "Schedule",
              onCancel: () => setEditingPost(null),
              onSubmit: onEditSubmit,
            })
          )
        : null
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
            { key: p.postId, className: "postCard" },
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

    async function logout() {
      try {
        // Best-effort: clear server cookie + revoke token
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (e) {
        // ignore
      }

      setAuth(null);
      try {
        window.localStorage.removeItem("slackBufferAuth");
      } catch (e) {
        // ignore
      }

      navigate("/");
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

    useEffect(() => {
      const protectedPaths = [
        "/create",
        "/scheduled",
        "/published",
        "/profile",
        "/app/create",
        "/app/scheduled",
        "/app/published",
        "/app/profile",
      ];

      if (!user && protectedPaths.includes(pathname)) {
        navigate("/login");
      }
    }, [pathname, user]);

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
              ? e(
                  React.Fragment,
                  null,
                  e(Link, { to: "/profile", className: "link" }, "Profile"),
                  e(
                    "a",
                    {
                      href: "/logout",
                      className: "link",
                      onClick: (evt) => {
                        evt.preventDefault();
                        logout();
                      },
                    },
                    "Logout"
                  )
                )
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
