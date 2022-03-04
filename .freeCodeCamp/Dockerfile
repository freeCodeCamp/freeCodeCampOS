FROM ubuntu

ARG USERNAME=camper
ARG HOMEDIR=/home/$USERNAME

ENV TZ="America/New_York"

RUN apt update && apt install -y sudo

# Unminimize Ubuntu to restore man pages
RUN yes | unminimize

# Set up timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Set up user, disable pw, and add to sudo group
RUN adduser --disabled-password \
  --gecos '' ${USERNAME}

RUN adduser ${USERNAME} sudo

RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> \
  /etc/sudoers

### Gitpod user ###
# '-l': see https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#user
RUN sudo useradd -l -u 33333 -G sudo -md /home/gitpod -s /bin/bash -p gitpod gitpod \
    # passwordless sudo for users in the 'sudo' group
    && sudo sed -i.bkp -e 's/%sudo\s\+ALL=(ALL\(:ALL\)\?)\s\+ALL/%sudo ALL=NOPASSWD:ALL/g' /etc/sudoers

# Install packages used in all projects - Docker for testing
RUN sudo apt install -y curl git bash-completion man-db docker 

# Other packages you may need for your project, add them to the above command
#build-essential
#postgresql
#postgresql-contrib
#nano

# Uncomment to install Rust for this project
# RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
# ENV PATH="/root/.cargo/bin:${PATH}"

# Install Node LTS
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
RUN sudo apt install -y nodejs

# /usr/lib/node_modules is owned by root, so this creates a folder ${USERNAME} 
# can use for npm install --global
WORKDIR ${HOMEDIR}
RUN mkdir ~/.npm-global
RUN npm config set prefix '~/.npm-global'

# Configure course-specific environment
RUN mkdir curriculum
COPY ./ ./curriculum/
WORKDIR ${HOMEDIR}/curriculum

