import express from "express";
import { exec } from "child_process";
import pm2 from "pm2";
import { Logger } from "winston";
import { Collection } from "discord.js";
import { ExtendedClient } from "./types";
import guildModel, {GuildDocument} from "#models/guild.js";
import { Constellation } from "#models/constellation";

export function initWebApi(mainLogger: Logger, client: ExtendedClient) {
  const app = express();
  const port = process.env.PORT;
  const apiLogger = mainLogger.child({ service: "API", hexColor: "#c8ffdc" });

  app.use("/api", (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token === process.env.API_TOKEN) {
        next();
      } else {
        res.status(401).send("Invalid Bearer token");
      }
    } else {
      res.status(401).send("Bearer token missing");
    }
  });
  app.post(`/${process.env.UPDATEPATH}`, async (req, res) => {
    apiLogger.notice(
      "An event has been detected on the listened port: starting execution..."
    );
    console.log(req);

    async function sh(
      cmd: string
    ): Promise<{ stdout: string; stderr: string }> {
      return new Promise(function (resolve, reject) {
        exec(cmd, (err, stdout, stderr) => {
          if (err) {
            reject(err);
          } else {
            resolve({ stdout, stderr });
          }
        });
      });
    }

    let { stdout } = await sh(`cd /home/ubuntu/BlackLotus && git pull`);
    console.log(stdout);
    apiLogger.notice(`Dados puxados do github, reiniciando...`);
    res.sendStatus(200);
    pm2.reload(`BlackLotus`, (err) => {
      console.log(err);
    });
  });
  app.get(`/api/constellations`, async (req, res) => {
    const servers = await client.blackLotusManager.fetchAllData();
    const constellations = new Collection<string, GuildDocument[]>();
    servers.forEach((server) => {
      if (constellations.get(server.modules.blackLotus.constellation.name)) {
        constellations.get(server.modules.blackLotus.constellation.name).push(server);
      } else {
        constellations.set(server.modules.blackLotus.constellation.name, [server]);
      }
    });
    let obj = {};
    for (const [name, servers] of constellations) {
      obj[name] = servers.map((server) => {
        const guild = client.guilds.cache.get(server.id);
        if (!guild)
          return {
            cached: false,
            id: server.id,
            displayName: server.modules.blackLotus.displayName,
            constellation: {
              name: server.modules.blackLotus.constellation.name,
              minMembers: server.modules.blackLotus.constellation.minimumMemberAmmout,
            },
            partnerships: server.modules.partnerships,
            invite: server.modules.blackLotus.invite,
          };
        return {
          cached: true,
          currentName: guild.name,
          id: guild.id,
          displayName: server.modules.blackLotus.displayName,
          constellation: {
            name: server.modules.blackLotus.constellation.name,
            minMembers: server.modules.blackLotus.constellation.minimumMemberAmmout,
            joinedAt: server.modules.blackLotus.joinedAt || null,
          },
          members: guild.memberCount,
          partnerships: server.modules.partnerships,
          invite: server.modules.blackLotus.invite,
          icon: guild.iconURL({ size: 1024 }),
          description: guild.description,
          banner: guild.bannerURL({ size: 1024 }),
        };
      });
    }
    res.status(200).json(obj);
  });
  app.get(`/api/syndicate/guilds`, async (req, res) => {
    const servers = await client.syndicateManager.fetchAllData()
    const guilds = [];
    for (const server of servers) {
      const guild = client.guilds.cache.get(server.id);
      if (!guild)
        guilds.push({
          cached: false,
          id: server.id,
          displayName: server.modules.syndicate.displayName,
          partnerships: server.modules.partnerships,
          invite: server.modules.syndicate.invite,
        })
      else
        guilds.push({
          cached: true,
          currentName: guild.name,
          id: guild.id,
          displayName: server.modules.syndicate.displayName,
          members: guild.memberCount,
          partnerships: server.modules.partnerships,
          invite: server.modules.syndicate.invite,
          icon: guild.iconURL({ size: 1024 }),
          description: guild.description,
          banner: guild.bannerURL({ size: 1024 }),
        })
    }
    res.status(200).json(guilds);
  });
  app.listen(port, () => {
    apiLogger.notice(`Listening on port ${port}`);
  });
}
