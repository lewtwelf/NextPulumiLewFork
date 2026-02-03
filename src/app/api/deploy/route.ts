import { NextRequest, NextResponse } from 'next/server';
import { InlineProgramArgs, LocalWorkspace } from '@pulumi/pulumi/automation';
import { pulumiProgram } from '@/lib/pulumi/program';

// Define the shape of our request body
interface DeployRequest {
  instanceName: string;
  zone?: string;
  machineType?: string;
  project?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as DeployRequest;
    const { instanceName, zone = 'us-central1-a', machineType = 'e2-micro', project = process.env.GCP_PROJECT_ID } = body;

    if (!instanceName) {
      return NextResponse.json({ error: 'instanceName is required' }, { status: 400 });
    }
    
    if (!project) {
        return NextResponse.json({ error: 'GCP Project ID is required (via env GCP_PROJECT_ID or body)' }, { status: 400 });
    }

    const stackName = "dev";
    const projectName = "nextjs-gcp-compute";

    // Define the inline program
    const program = async () => pulumiProgram({
        instanceName,
        zone,
        machineType,
        project
    });

    const args: InlineProgramArgs = {
      stackName,
      projectName,
      program
    };

    // Create or select the stack
    // Using LocalWorkspace to manage the stack. 
    // State will be stored in the backend configured in the environment (defaulting to app.pulumi.com if PULUMI_ACCESS_TOKEN is set)
    const stack = await LocalWorkspace.createOrSelectStack(args);

    // Set stack configuration
    await stack.setConfig("gcp:project", { value: project });
    await stack.setConfig("gcp:region", { value: zone.substring(0, zone.lastIndexOf('-')) });

    console.log("refreshing stack...");
    await stack.refresh({ onOutput: console.info });
    
    console.log("updating stack...");
    const upRes = await stack.up({ onOutput: console.info });

    return NextResponse.json({ 
        message: 'Deployment successful', 
        outputs: upRes.outputs,
        summary: upRes.summary 
    });

  } catch (error: any) {
    console.error('Deployment failed:', error);
    return NextResponse.json({ error: error.message || 'Deployment failed' }, { status: 500 });
  }
}
