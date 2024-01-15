FROM ubuntu:22.04

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get install -y --no-install-recommends \
  # support env timezones
  tzdata \
  # vscode requirements
  gnome-keyring wget curl python3 ca-certificates \
  git build-essential \
  # clean up
  && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://code-server.dev/install.sh | sh

COPY ./code-server/config.yaml /root/.config/code-server/
COPY .vscode/settings.json /root/.local/share/code-server/User/settings.json

COPY ../.vscode/freecodecamp-courses-2.0.0.vsix $HOME
COPY ../.vscode/freecodecamp-dark-vscode-theme-1.0.0.vsix $HOME
RUN code-server --install-extension freecodecamp-courses-2.0.0.vsix
RUN code-server --install-extension freecodecamp-dark-vscode-theme-1.0.0.vsix
# code-server --host 0.0.0.0 --auth none
CMD ["code-server"]




# NEW
# freecodecamp-os$ docker compose up
# ---------------------------------------------
# $ docker build -t vsweb -f Dockerfile.vsweb . 2> log.txt
# $ docker run -p 8080:8080 vsweb

# /root/.local/share/code-server/coder.json contains query params
# - TODO: Copy to volume to persist