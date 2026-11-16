import { prisma } from "@/lib/prisma";
import { DiscoveryService } from "@/core/service/discovery.service";

export const discoveryService = new DiscoveryService(prisma);