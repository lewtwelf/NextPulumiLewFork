import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Defined as a function to be used by Automation API
export const pulumiProgram = async (config: {
    instanceName: string;
    zone: string;
    machineType: string;
    project: string;
}) => {
    // Create a GCP resource (Compute Engine Instance)
    const instance = new gcp.compute.Instance(config.instanceName, {
        name: config.instanceName,
        machineType: config.machineType,
        zone: config.zone,
        bootDisk: {
            initializeParams: {
                image: "debian-cloud/debian-11",
            },
        },
        networkInterfaces: [{
            network: "default",
            accessConfigs: [{}], // This requests an ephemeral public IP
        }],
        tags: ["http-server"],
        project: config.project,
    });

    return {
        instanceName: instance.name,
        instanceExternalIp: instance.networkInterfaces.apply(ni => ni[0].accessConfigs![0].natIp),
    };
};
