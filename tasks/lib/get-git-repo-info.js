function getGitRepoInfo(initialUrl) {
  const [
    initial, 
    protocol, 
    service, 
    delimiter, 
    repo,
    paths,
  ] = /(git@|https?:\/\/|https?:\/\/|ssh?:\/\/)([a-zA-Z0-9\.\-_]+)(\/|:)([a-zA-Z0-9\-]+)(.*)(\.git)/g.exec(initialUrl) || [];
  const isHttp = /http(s)?/.test(protocol);
  const isPort = /[0-9]/g.test(repo);
  const portChunk = isPort ? `:${repo}` : '';
  const repoChunk = isPort ? '' : `/${repo}`;
  
  const fullUrl = isHttp ? 
    initial.replace(/\.git+/g, '') : 
    `https://${service}${portChunk}${repoChunk}${paths}`;

  const result = { 
    initialUrl, 
    protocol, 
    service,
    port: isPort ? repo : '', 
    repo: isPort ? '' : repo, 
    repoUrl: service ? fullUrl : initialUrl 
  };

  return result;
}

module.exports = getGitRepoInfo;
