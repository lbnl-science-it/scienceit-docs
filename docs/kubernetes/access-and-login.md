# Get access and log in

!!! warning "Under construction"

    The Berkelium cluster and this documentation are actively being worked on. Details on this page may change without notice. If something does not work as described, please contact us at <a href="mailto:scienceit@lbl.gov">scienceit@lbl.gov</a>.

Once your account is created, follow the steps below to access Berkelium.

Access to Berkelium is managed through [OpenID Connect (OIDC)](https://openid.net/developers/how-connect-works/). Instead of a long-lived credential, you download a `kubeconfig` file for the cluster, and `kubectl` authenticates you through your browser the first time you run a command. The resulting access token is stored in your local keychain, so you only sign in occasionally.

## 1. Download the kubeconfig file

Download the config file for Berkelium after you have been granted access to it, and place it in your `~/.kube` directory:

[:material-download: Download Config File](config){ .md-button .md-button--primary download="config" }

```sh
mkdir -p ~/.kube
mv ~/Downloads/config ~/.kube/
```

!!! note "Already have a `~/.kube/config`?"
    `kubectl` reads `~/.kube/config` by default, so do not overwrite it if it already holds credentials for another cluster. Save the Berkelium file under a different name, for example `~/.kube/config_berkelium.yaml`, and point `kubectl` at it with the `KUBECONFIG` environment variable or with [kubie](https://github.com/sbstp/kubie) (see [Select a cluster](#4-select-a-cluster)).

## 2. Install kubectl

`kubectl` is the command line tool used to talk to a Kubernetes cluster. Follow the official instructions for your operating system:

- [Install kubectl on macOS](https://kubernetes.io/docs/tasks/tools/install-kubectl-macos/)
- [Install kubectl on Linux](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)
- [Install kubectl on Windows](https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/)

Verify the install with:

```sh
kubectl version --client
```

## 3. Install the OIDC plugin

Authentication is handled by [`kubelogin`](https://github.com/int128/kubelogin), a `kubectl` plugin that performs the browser based OIDC login and caches the resulting token. Follow the [setup instructions](https://github.com/int128/kubelogin#setup) in the kubelogin repository to install it.

If you use [Homebrew](https://brew.sh) (on either macOS or Linux), the plugin is a single command:

```sh
brew install kubelogin
```

!!! note "Plugin naming"
    `kubectl` discovers plugins by name, so the binary must be on your `PATH` as `kubectl-oidc_login`. The packaged installs take care of this for you.

## 4. Select a cluster

Confirm that `kubectl` is using the config file you downloaded:

```console
$ kubectl config get-contexts
CURRENT   NAME             CLUSTER     AUTHINFO         NAMESPACE
*         oidc@berkelium   berkelium   oidc@berkelium
```

The `*` in the `CURRENT` column marks the context that commands will run against. If you have access to multiple Kubernetes clusters, several contexts will be listed and you need to select Berkelium explicitly:

```sh
kubectl config use-context oidc@berkelium
```

If you saved the Berkelium file under a different name, point `kubectl` at it first:

```sh
export KUBECONFIG=~/.kube/config_berkelium.yaml
```

If you work with more than one cluster, [kubie](https://github.com/sbstp/kubie) makes switching between them easier. It starts a subshell with the selected context, so different terminal windows can talk to different clusters at the same time.

```sh
brew install kubie   # macOS
kubie ctx            # pick a cluster from an interactive list
```

## 5. Log in

Run any `kubectl` command to trigger authentication:

```sh
kubectl get pods
```

Your browser will open and prompt you to sign in. Once you have authenticated, the access token is written to your local vault (the Keychain on macOS) and the command completes. Subsequent commands reuse the cached token, and you will only be asked to sign in again after it expires.

```console
$ kubectl get pods
NAME                        READY   STATUS    RESTARTS   AGE
my-pod-7d8f9c5b4d-x2klm     1/1     Running   0          3h
```

!!! tip "No pods yet?"
    A response of `No resources found in <namespace> namespace.` means the login worked and your namespace is simply empty.

## Troubleshooting

- **The browser does not open.** Copy the URL printed in the terminal and open it manually. If you are working over SSH, forward the local port `kubelogin` listens on (`8000` by default).
- **`error: unknown command "oidc-login"`.** The plugin is not on your `PATH` under the name `kubectl-oidc_login`. Check with `kubectl plugin list`.
- **Commands run against the wrong cluster.** Confirm which config is active with `kubectl config current-context` and check the value of `KUBECONFIG`.
