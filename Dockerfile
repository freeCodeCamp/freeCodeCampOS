FROM gitpod/workspace-node-lts:2023-09-15-18-50-46

WORKDIR /workspace/freeCodeCampOS

COPY --chown=gitpod:gitpod . .
