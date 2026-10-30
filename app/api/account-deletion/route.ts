import { proxyAccountDeletion } from "./proxy";

export async function POST(request: Request): Promise<Response> {
  return proxyAccountDeletion(request);
}
