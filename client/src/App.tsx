import { Switch, Route } from "wouter";
import { Home } from "@/pages/home";
import NotFound from "@/pages/not-found";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
      <Analytics />
    </>
  );
}

export default App;
