{
  description = "workspace configuration for git-bug";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    flake-parts.url = "github:hercules-ci/flake-parts";

    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    { nixpkgs, ... }@inputs:
    let
      systems = inputs.flake-utils.lib.defaultSystems;
    in
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      inherit systems;

      imports = [ inputs.treefmt-nix.flakeModule ];

      perSystem =
        { pkgs, ... }:
        {
          treefmt = import ./treefmt.nix { inherit pkgs; };

          checks = pkgs.lib.attrsets.mapAttrs' (f: _: {
            name = pkgs.lib.strings.removeSuffix ".nix" f;
            value = import ./nix/checks/${f} {
              inherit pkgs;
              src = ./.;
            };
          }) (pkgs.lib.attrsets.filterAttrs (_: t: t == "regular") (builtins.readDir ./nix/checks));

          devShells.default = pkgs.mkShell {
            packages = with pkgs; [
              codespell
              delve
              gh
              git
              git-cliff
              go
              golangci-lint
              gopls
              nodejs
              pinact
            ];

            shellHook = builtins.readFile ./flake-hook.bash;
          };
        };
    };
}
