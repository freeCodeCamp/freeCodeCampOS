FROM gitpod/workspace-full:2024-01-17-19-15-31

WORKDIR /workspace/freeCodeCampOS

COPY --chown=gitpod:gitpod . .
