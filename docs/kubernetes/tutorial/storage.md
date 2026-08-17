# Storage Tutorial

!!! warning "Under construction"

    The Berkelium cluster and this documentation are actively being worked on. Details on this page may change without notice. If something does not work as described, please contact us at <a href="mailto:scienceit@lbl.gov">scienceit@lbl.gov</a>.

In the [Basic Kubernetes](basic.md) tutorial you saw that pods are stateless: files you create inside a container are gone the moment the pod restarts. This tutorial covers the other half of that story — how to get storage that outlives a pod, and how to attach it to your containers.

In Kubernetes, a **PersistentVolumeClaim** (PVC) is a request for storage from a **StorageClass** defined in the cluster. StorageClasses abstract away the details of storage provisioning, so you can ask for "10 GiB of block storage" without knowing anything about the hardware behind it.

## Prerequisites

This tutorial builds on [Basic Kubernetes](basic.md). You should be comfortable creating pods and deployments from YAML manifests, and `kubectl get pods` should return a result rather than an authentication error. Make sure your namespace is set as described in [Setting your namespace](basic.md#setting-your-namespace).

## Storage types

A Kubernetes cluster offers several ways to hold data:

* **Local storage.** Pods can use storage directly attached to the node they are scheduled on. It is fast, but it is not portable across nodes and it disappears if the node fails or the pod is rescheduled elsewhere.
* **Persistent volumes (PV).** Cluster-wide storage resources. They are not tied to any particular pod. On Berkelium, PVs are created dynamically when you make a claim, so you will rarely create one by hand.
* **Persistent volume claims (PVC).** Requests for storage made by you, specifying size, access mode, and storage class, without needing to know the underlying implementation.
* **Object storage.** S3-compatible storage, accessed over the network from inside your container rather than mounted as a filesystem.

PVCs are scoped to a namespace: a claim created in one namespace is not visible or usable from another.

## Temporary storage with emptyDir

An `emptyDir` volume is created empty when a pod is assigned to a node, and it lives exactly as long as that pod does. When the pod is removed, its contents are deleted permanently. It is useful as scratch space — a place for intermediate files, caches, or output that you will copy elsewhere before the job ends — and it is shared between all containers in the same pod.

!!! warning "emptyDir uses the node's disk"

    An `emptyDir` consumes ephemeral storage on the node your pod landed on. If you expect to write a significant amount of scratch data, declare it with `resources.requests.ephemeral-storage` (and optionally a matching limit) so the scheduler places your pod on a node that can hold it. Pods that write far more ephemeral data than they requested can be evicted.

Copy the manifest below into a new file called `strg1.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-storage
  labels:
    k8s-app: test-storage
spec:
  replicas: 1
  selector:
    matchLabels:
      k8s-app: test-storage
  template:
    metadata:
      labels:
        k8s-app: test-storage
    spec:
      containers:
      - name: mypod
        image: alpine
        resources:
           limits:
             memory: 100Mi
             cpu: 100m
           requests:
             memory: 100Mi
             cpu: 100m
        command: ["sh", "-c", "apk add dumb-init && dumb-init -- sleep 100000"]
        volumeMounts:
        - name: mydata
          mountPath: /mnt/myscratch
      volumes:
      - name: mydata
        emptyDir: {}
```

Two things are worth noticing before you run it. This is a *deployment* rather than a bare pod, so the cluster will recreate the container if it dies — which is what makes the experiment below interesting. And the image is `alpine`, not `ubuntu`.

### Start the deployment

```sh
kubectl create -f strg1.yaml
```

Find the pod the deployment created for you:

```sh
kubectl get pods -o wide
```

Now log in. If you reach for the command you used in the previous tutorial:

```sh
kubectl exec -it test-storage-<hash> -- /bin/bash
```

it will fail. Alpine Linux is a minimal, security-oriented distribution that is popular in containers precisely because it is small — and one of the things it leaves out is `bash`. It ships `ash` (the Almquist Shell) instead, which is POSIX-compliant and covers the basics but lacks many of `bash`'s conveniences. So use:

```sh
kubectl exec -it test-storage-<hash> -- /bin/ash
```

Once inside, create a directory under the mounted volume and put a file in it:

```sh
mkdir /mnt/myscratch/$USER
cat > /mnt/myscratch/$USER/notes.txt
```

Type a line or two, then press `Control-D` to write the file. Create some files outside `/mnt/myscratch` as well — in `/root` or `/tmp`, for instance — so you can compare what happens to them.

Now kill the container from the inside:

```sh
kill 1
```

Because this is a deployment, the cluster brings up a replacement pod. Wait a few seconds, list the pods again (the hash in the name will have changed), and log back in with `/bin/ash`. Both the files in `/mnt/myscratch` and the ones elsewhere are gone: the `emptyDir` did not survive the pod, and neither did the container's own filesystem.

Delete the deployment before moving on:

```sh
kubectl delete -f strg1.yaml
```

## Creating a persistent volume claim

Alongside the compute nodes, Berkelium has a distributed [Ceph](https://ceph.io/) storage cluster that provides persistent storage to pods. Ceph gives us scalability, high availability, fault tolerance, and dynamic provisioning: when you create a claim, a volume is created for you automatically.

The manifest below does both halves of the job in one file — it requests 10 GiB of Ceph RBD block storage, and defines a pod that mounts it at `/data1`. Save it as `pvc.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: test-spss-rbd
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: ceph-rbd
---
apiVersion: v1
kind: Pod
metadata:
  name: vol-pod
spec:
  containers:
    - name: vol-container
      image: ubuntu
      resources:
        requests:
          cpu: 0.1
          memory: 16Mi
        limits:
          cpu: 5
          memory: 5Gi
      command: ["sleep", "infinity"]
      volumeMounts:
        - mountPath: "/data1"
          name: vol1
  volumes:
    - name: vol1
      persistentVolumeClaim:
        claimName: test-spss-rbd
```

The `---` separator lets a single file hold more than one object. The three fields that connect them are worth tracing: the claim is named `test-spss-rbd`; the pod's `volumes` section attaches that claim and gives it the local name `vol1`; and `volumeMounts` mounts `vol1` into the container at `/data1`.

The `accessModes` field asks for `ReadWriteOnce`, which means the volume can be mounted read-write by a single node at a time. This is the normal choice for block storage like Ceph RBD, and it is what you want for most single-pod workloads. If you need several pods on different nodes to write to the same volume simultaneously, you need a shared filesystem class instead.

Create both objects:

```sh
kubectl create -f pvc.yaml
```

Check the claim:

```sh
kubectl get pvc -o wide
```

The `STATUS` column should read `Bound`, which means a persistent volume was provisioned and attached to your claim. If it stays `Pending`, describe it to see why:

```sh
kubectl describe pvc test-spss-rbd
```

Once the pod is `Running`, log in and look at the mount:

```sh
kubectl exec -it vol-pod -- /bin/bash
```

```sh
df -h /data1
```

You should see roughly 10 GiB of space mounted at `/data1`. Write something to it:

```sh
mkdir /data1/$USER
cat > /data1/$USER/notes.txt
```

Then exit the pod.

### Confirming the data persists

Delete the pod, but leave the claim alone:

```sh
kubectl delete pod vol-pod
```

Recreate it from the same file:

```sh
kubectl apply -f pvc.yaml
```

Use `apply` rather than `create` here: the PVC in the file already exists, and `create` would fail on it. `apply` leaves the existing claim untouched and creates just the missing pod.

Log back in and look in `/data1`:

```sh
kubectl exec -it vol-pod -- /bin/bash
```

```sh
ls -l /data1/$USER
```

Your file is still there. The pod was destroyed and rebuilt, but the volume — and everything on it — outlived it. That is the whole point of a persistent volume claim: keep your data in the volume, and treat everything else in the container as disposable.

## Exploring storage classes

The class you request determines what kind of storage you get. List the classes available on the cluster with:

```sh
kubectl get storageclass
```

Not every class listed will be usable by you or by your namespace, and the class marked `(default)` is what you get if you omit `storageClassName` from your claim. In general, block storage classes such as `ceph-rbd` give the best performance for a single pod, while shared filesystem classes trade some performance for the ability to mount the same volume from many pods at once. Choose based on whether your workload needs concurrent access.

!!! tip "Keep compute near storage"

    Volumes are attached over the network. For I/O-heavy work, scheduling your pods close to the storage they use makes a measurable difference.

## Cleaning up

Berkelium is a shared resource, so clean up when you are finished. Delete the pod and the claim:

```sh
kubectl delete -f pvc.yaml
```

Then confirm nothing is left behind:

```sh
kubectl get pods
kubectl get deployments
kubectl get pvc
```

!!! warning "Deleting a claim deletes your data"

    Removing a PVC releases the underlying volume and destroys its contents. Copy anything you want to keep off the volume first.

## Next steps

More Berkelium tutorials, covering batch jobs and using GPUs, are coming soon. If you run into trouble or have questions about storage on Berkelium, contact us at <a href="mailto:scienceit@lbl.gov">scienceit@lbl.gov</a>.
