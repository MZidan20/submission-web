function extractPathnameSegments(path) {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const splitUrl = normalizedPath.split("/");

  return {
    resource: splitUrl[0] || null,
    id: splitUrl[1] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = "/";

  if (pathSegments.resource) {
    pathname = `/${pathSegments.resource}`;

    if (pathSegments.id) {
      pathname = `${pathname}/:id`;
    }
  }

  return pathname;
}

export function getActivePathname() {
  return window.location.hash.slice(1) || "/";
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}