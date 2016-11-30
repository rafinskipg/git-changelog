<% if logo { %>
  <img width="300px" src="<%= logo %>" />
<% } %>

# <%= title %>

<% if intro { %>
_<%= intro %>_
<% } %>

<% if version { %>
  ## <%= version.name %> <%= version.number %> ( <%= version.date %> )
<% } %>

<% _.forEach(sections, function(section){ %>

### <%= section.title %>
  <% _.forEach(section.commits, function(commit){ %>


  <% }) %>

<% }) %>