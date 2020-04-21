DA COMMIT: <%= commit.subject %> <%= link %> 
  <% if (closes) { %>(<%= closes %>)<% } %>
  <%= JSON.stringify(commit) %>