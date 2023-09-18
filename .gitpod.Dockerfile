FROM gitpod/workspace-full:2023-09-17-06-15-08

ARG REPO_NAME=freeCodeCampOS
ARG WORKSPACE_DIR=/workspace/$REPO_NAME

WORKDIR ${WORKSPACE_DIR}

RUN bash -c 'VERSION="18" \
    && source $HOME/.nvm/nvm.sh && nvm install $VERSION \
    && nvm use $VERSION && nvm alias default $VERSION'

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix

RUN sudo apt-get update && sudo apt-get upgrade -y
