FROM gitpod/workspace-node-lts:2024-01-14-15-48-07

WORKDIR /workspace/freeCodeCampOS

COPY --chown=gitpod:gitpod . .
