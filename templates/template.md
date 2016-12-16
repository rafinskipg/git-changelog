<% if(logo) { %>
  <img width="300px" src="<%= logo %>" />
<% } %>

# <%= title %>

<% if(intro) { %>
_<%= intro %>_
<% } %>

<% if(version) { %>
  ## <%= version.name %> <%= version.number %> ( <%= version.date %> )
<% } %>

<% _.forEach(sections, function(section){ 
  if(section.commitsCount > 0) { %>
## <%= section.title %>
<% _.forEach(section.commits, function(commit){ %>
  - <%= commit.subject %> (<%= commit.hash %><% if(commit.closes.length){ %>, Closes: <%= getCommitCloses(commit).join(',') %><% } %>
<% }) %>
<% _.forEach(section.components, function(component){ %>
  - <%= component.name %>
<% _.forEach(component.commits, function(commit){ %>
    - <%= commit.subject %> (<%= commit.hash %><% if(commit.closes.length){ %>, Closes: <%= getCommitCloses(commit).join(',') %><% } %>)
<% }) %>
<% }) %>
<% }) %>

<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problems or suggestions, create an issue.* :) **Thanks** </sub></sup>