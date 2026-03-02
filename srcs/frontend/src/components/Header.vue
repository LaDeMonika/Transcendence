<template>
  <!-- This Nav bar is only for landing page - need some ajustment for the rest -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <div class="col-sm d-flex justify-content-start">
        <a class="navbar-brand" href="#">Logo here</a>
      </div>

      <div class="col-sm d-flex justify-content-center collapse navbar-collapse">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <a class="nav-link" href="#">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Help</a>
          </li>
        </ul>
      </div>

      <div class="col-sm d-flex justify-content-end">
        <form class="form-inline">
          <button class="btn btn-outline-success" type="button">Login/Signup</button>
        </form>
      </div>
    </div>
  </nav>
</template>
