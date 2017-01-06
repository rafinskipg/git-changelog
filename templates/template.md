<% if(logo) { %><img width="300px" src="<%= logo %>" /><%= '\n\n' %><% } %># <%= title %>
<% if(intro) { %><%= '\n' %>_<%= intro %>_<%= '\n' %><% } %>
<% if(version && (version.name || version.number)) { %>##<% if(version.name){%> <%= version.name %><% } %> <%= version.number %> <% if(version.date){ %>( <%= version.date %> )<% } %><%= '\n' %><% } %>
<% _.forEach(sections, function(section){ 
  if(section.commitsCount > 0) { %>
## <%= section.title %>
<% _.forEach(section.commits, function(commit){ %>  - <%= printCommit(commit, true) %><% }) %>
<% _.forEach(section.components, function(component){ %>  - **<%= component.name %>**
<% _.forEach(component.commits, function(commit){ %>    - <%= printCommit(commit, true) %><% }) %>
<% }) %>
<% } %>
<% }) %>

---
<sub><sup>*Generated with [git-changelog](https://github.com/rafinskipg/git-changelog). If you have any problems or suggestions, create an issue.* :) **Thanks** </sub></sup>