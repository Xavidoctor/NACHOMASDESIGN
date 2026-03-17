import "server-only";

type VercelDeployment = {
  uid?: string;
  createdAt?: number;
  readyState?: string;
};

type VercelDeploymentsResponse = {
  deployments?: VercelDeployment[];
};

export type VercelUsageResult = {
  deployments30d: number;
  successfulDeployments30d: number;
  latestDeploymentAt: string | null;
};

function getVercelConfig() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !projectId) return null;
  return { token, projectId, teamId };
}

export async function fetchVercelUsage(): Promise<VercelUsageResult | null> {
  const config = getVercelConfig();
  if (!config) return null;

  const now = Date.now();
  const from = now - 30 * 24 * 60 * 60 * 1000;
  const query = new URLSearchParams({
    projectId: config.projectId,
    since: String(from),
    until: String(now),
    limit: "100",
  });
  if (config.teamId) {
    query.set("teamId", config.teamId);
  }

  const response = await fetch(`https://api.vercel.com/v6/deployments?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar la API de Vercel.");
  }

  const payload = (await response.json()) as VercelDeploymentsResponse;
  const deployments = payload.deployments ?? [];

  const successful = deployments.filter(
    (item) => item.readyState === "READY" || item.readyState === "ready",
  );

  const latestMs = deployments.reduce((acc, item) => {
    const created = Number(item.createdAt ?? 0);
    return created > acc ? created : acc;
  }, 0);

  return {
    deployments30d: deployments.length,
    successfulDeployments30d: successful.length,
    latestDeploymentAt: latestMs > 0 ? new Date(latestMs).toISOString() : null,
  };
}
