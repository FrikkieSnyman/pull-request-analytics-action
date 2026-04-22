import * as core from "@actions/core";

function isEnvGHA(): boolean {
    return process.env.GITHUB_ACTIONS === 'true';
}

function getInput(name: string): string {
    if (isEnvGHA()) {
        return (process.env[name] || core.getInput(name)).trim();
    } else {
        return (process.env[name] || '').trim();
    }
}

export function setOutput(name: string, value: string): void {
    if (isEnvGHA()) {
        core.setOutput(name, value);
    } else {
        console.log(`Output ${name}: ${value}`);
        process.env[name] = value;
    }
}

export const getMultipleValuesInput = (name: string): string[] => {
  const values = getValueAsIs(name);
  return values
    .split(",")
    .map((el) => el.trim())
    .filter((el) => el);
};

export const getValueAsIs = (name: string): string => {
  return getInput(name);
};

export const setFailed = (message: string): void => {
    if (isEnvGHA()) {
        core.setFailed(message);
    } else {
        console.error(`Error: ${message}`);
        process.exit(1);
    }
}