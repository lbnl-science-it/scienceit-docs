# Basic Kubernetes Tutorial

!!! warning "Under construction"

    The Berkelium cluster and this documentation are actively being worked on. Details on this page may change without notice. If something does not work as described, please contact us at <a href="mailto:scienceit@lbl.gov">scienceit@lbl.gov</a>.

In this tutorial you will be introduced to basic Kubernetes (k8s) commands, how to launch simple pods and deployments, and how to query the cluster for the status of your work. You will also see your first example of a YAML manifest.

## Prerequisites

This tutorial assumes you have an account on Berkelium and have already completed [Get access and log in](../access-and-login.md), so that `kubectl get pods` returns a result rather than an authentication error.

## Setting your namespace

On Berkelium your work runs inside a **namespace**, and you only have permission to run in namespaces you are a member of. Because of this, every command needs to know which namespace to use.

The simplest approach is to set the namespace once for your Berkelium context:

```sh
kubectl config set-context oidc@berkelium --namespace=<your-namespace>
```

If you are not sure which namespaces you belong to, contact us at <a href="mailto:scienceit@lbl.gov">scienceit@lbl.gov</a>.

Some users work across several namespaces at the same time. You can override the namespace on any individual command by adding `-n <a-namespace>`, whether or not you have set the context as above:

```sh
kubectl get pods -n <a-namespace>
```

Most users save the keystrokes by setting the context once and only deviating when necessary.

!!! note "Using a non-default kubeconfig"

    If you saved the Berkelium config under a name other than `~/.kube/config`, remember to point `kubectl` at it first with `export KUBECONFIG=~/.kube/config_berkelium.yaml`, or use [kubie](https://github.com/sbstp/kubie). See [Select a cluster](../access-and-login.md#4-select-a-cluster).

## Explore the system

Now that your namespace is set, let's explore the cluster.

### List cluster nodes

Berkelium is made up of a number of compute nodes with different amounts of CPU, memory, and GPUs. You can get a sense of what is in the cluster with:

```sh
kubectl get nodes
```

Add `-o wide` to see more detail, or describe a single node to see its capacity and the labels that describe its hardware:

```sh
kubectl describe node <node-name>
```

!!! note

    You will not be able to schedule work on every node listed. Some nodes are reserved for specific groups or for cluster services.

### List processes running in your namespace

There are three categories of objects we will look at:

* pods
* deployments
* services

Listing any category follows the same format:

```sh
kubectl get <category>
```

Right now you probably have nothing running, and these commands will return `No resources found in <namespace> namespace.` You will revisit them throughout the tutorials as a way of checking status.

!!! note "Listing pods, deployments and services"

    === "List pods"

        List all the pods in your namespace:

        ```sh
        kubectl get pods
        ```

    === "List deployments"

        List all the deployments in your namespace:

        ```sh
        kubectl get deployments
        ```

    === "List services"

        List all the services in your namespace:

        ```sh
        kubectl get services
        ```

## Set up your first pod with YAML

Let's create a simple generic pod, and then log into it.

### A simple YAML file

Create a file named `pod1.yaml` with the following contents:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  containers:
  - name: mypod
    image: ubuntu:24.04
    resources:
      limits:
        memory: 200Mi
        cpu: 200m
      requests:
        memory: 200Mi
        cpu: 200m
    command: ["sh", "-c", "echo 'Im a new pod' && sleep infinity"]
```

!!! note "Indentation matters"

    Indentation is important in YAML, just like in Python.

The `resources` block asks the scheduler for 200 MiB of memory and 200 millicores (0.2 of a CPU core), and caps the container at the same values. Always declare `requests` and `limits` on a shared cluster: the request is what the scheduler reserves for you, and the limit is what keeps a runaway container from crowding out everyone else.

!!! info "A simple way to create a file in Unix"

    There are many ways to create a file and put data into it. One of the easiest is to redirect standard input:

    ```sh
    cat > pod1.yaml
    ```

    Paste the copied text or type directly into the terminal. When you are done, press `Control-D` to close the input stream and write the file. Try it by copying the `pod1.yaml` sample above and pasting it in.

!!! info "Creating YAML files dynamically"

    Alternatively, if you don't want to create a file at all, you can pipe the manifest straight into `kubectl` from a Unix-like shell:

    ```sh
    kubectl create -f - << EOF
    <contents you want to deploy>
    EOF
    ```

### Launch a simple pod

From the same directory as your `pod1.yaml` file, run:

```sh
kubectl create -f pod1.yaml
```

After a few moments, as the pod is created, see if you can find it:

```sh
kubectl get pods
```

!!! note

    If you share a namespace with colleagues, you will see their pods here too.

If it is not yet in `Running` state, check what is going on with the list of events in your namespace:

```sh
kubectl get events --sort-by=.metadata.creationTimestamp
```

Events, along with other useful information about the pod, can also be seen with `describe`:

```sh
kubectl describe pod test-pod
```

```sh
kubectl logs test-pod
```

And log into it:

```sh
kubectl exec -it test-pod -- /bin/bash
```

!!! note "The shell depends on the image"

    The last part of that command, `/bin/bash`, depends on what is available inside the container image you chose. Many minimal images (Alpine, `distroless`, and similar) do not ship `bash`, and you will need `/bin/sh` or nothing at all. Keep this in mind when you deploy images other than Ubuntu.


Try creating some directories and some files with content (using the `cat` command, if you like).

### Let's examine the pod's networking

Networking inside a Kubernetes pod is what lets containers in the same pod talk to each other, and lets your pod reach other pods and external services. Understanding it is essential to deploying applications effectively. Let's look at how the network is configured inside our simple pod.

!!! question "Question?"

    Do we have the tools we need to examine the network installed in our pod?

Remember that pods running in k8s are "stateless", and we did not specify any extra software packages when we launched this one, so we have some work to do first.

`ifconfig` is not part of the base Ubuntu image, so let's install it. First make sure the package index is up to date:

```sh
apt update
```

Then install the network tools:

```sh
apt install net-tools
```

Now check the networking:

```sh
ifconfig -a
```

!!! question "Question?"

    What did you discover? Does the output look like you would expect? What IP address did the pod get, and is it one you could reach from your laptop?

Finally, exit the pod with the `exit` command or the keyboard shortcut `Control-D`.

### Testing statelessness

To demonstrate that pods really are stateless, we are going to shut our pod down, create it again, and take another look.

Delete the pod with `kubectl`:

```sh
kubectl delete -f pod1.yaml
```

This may take a moment, as the system removes the pod gracefully. After a few moments, check that it is actually gone:

```sh
kubectl get pods
```

!!! question "Question?"

    Is it gone?

If yes, create it again:

```sh
kubectl create -f pod1.yaml
```

!!! tip "Accessing prior commands"

    Most shells store the commands you have recently entered. Pressing the up arrow is a quick way to repeat them, and `Control-R` searches back through your history.

Let's take a look at pod1.yaml again. Give the system a moment to create the new pod.

!!! question "Question?"

    Does it have the same IP address? Check with:

    ```sh
    kubectl get pod -o wide test-pod
    ```

Log back into the pod:

```sh
kubectl exec -it test-pod -- /bin/bash
```

Now look for the files you created earlier. Are they where you left them? What about the `net-tools` package you installed?

!!! question "Question?"

    How does this exercise demonstrate "statelessness", and what does it imply about how you should prepare for the inevitable and normal restarting of a pod?

### Cleaning up

Berkelium is a shared platform and a community resource, so it is important not to leave stray processes running. Every time you are finished with a pod, clean up after yourself. In this case, we can delete our pod using the following command:

```sh
kubectl delete pod test-pod
```

## Turning our pod into a deployment

You saw that when a pod was terminated, it was gone. We did it ourselves, but the result would have been the same if a node had died or been restarted. This is normal and expected in a k8s cluster, and is actually one of its great features: Kubernetes constantly monitors the health of pods and containers and, in the event of a failure, automatically restarts containers or entire pods to return to the state you asked for.

The way you describe that "desired state" to the cluster is with a **Deployment**.

Copy the manifest below into a new file called `dep1.yaml`.

=== "Deployment 1"

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-dep
  labels:
    k8s-app: test-dep
spec:
  replicas: 1
  selector:
    matchLabels:
      k8s-app: test-dep
  template:
    metadata:
      labels:
        k8s-app: test-dep
    spec:
      containers:
      - name: mypod
        image: ubuntu:24.04
        resources:
           limits:
             memory: 500Mi
             cpu: 500m
           requests:
             memory: 100Mi
             cpu: 50m
        command: ["sh", "-c", "sleep infinity"]
```

Note that here the requests and limits differ: the scheduler reserves 100 MiB and 50 millicores for the container, but allows it to burst up to 500 MiB and 500 millicores before it is throttled or killed.

Start the deployment:

```sh
kubectl create -f dep1.yaml
```

See if you can find it:

```sh
kubectl get deployments
```

!!! note "A deployment is a description, not a process"

    A deployment describes the *ideal state* of your pods to the cluster; it doesn't do anything more than that. In this case the ideal state is a single replica of the container called `mypod`.

See if you can find the pod the deployment created for you:

```sh
kubectl get pods
```

The cluster assigns it a name of the form `test-dep-<hash>`. Use that name to inspect it and log in:

```sh
kubectl get pod -o wide test-dep-<hash>
kubectl exec -it test-dep-<hash> -- /bin/bash
```

You are now inside the container running in the pod.

### Testing statelessness with deployments

Create directories and files as before, and try the same commands you tried earlier.

Now delete the pod:

```sh
kubectl delete pod test-dep-<hash>
```

Is it really gone?

```sh
kubectl get pods
```

What happened to the deployment?

```sh
kubectl get deployments
```

Get into the new pod:

```sh
kubectl get pod -o wide test-dep-<hash>
kubectl exec -it test-dep-<hash> -- /bin/bash
```

!!! question "Question?"

    Was anything preserved? How might you make sure the settings, software packages, and data you need are present every time a pod starts?

### Using the right image helps with reliability and resiliency

Making sure the container you deploy has everything it needs to function means building a well-packaged, self-contained image. Unlike the simple examples above, a robust deployment starts from an appropriate base image and bakes in the system libraries, language runtimes, and dependencies your code requires, rather than installing them by hand after the pod starts.

!!! question "Question?"

    Looking at the `dep1.yaml` example above, what would you change to specify a different image? Keep that in mind as you work through the tutorials.

Now delete the deployment:

```sh
kubectl delete -f dep1.yaml
```

And verify that everything is gone:

```sh
kubectl get deployments
kubectl get pods
```

## Next steps

More Berkelium tutorials, covering persistent storage, running batch jobs, and using GPUs, are coming soon. In the meantime, if you run into trouble or have questions about running workloads on Berkelium, contact us at <a href="mailto:scienceit@lbl.gov">scienceit@lbl.gov</a>.
